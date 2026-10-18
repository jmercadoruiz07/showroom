import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

// Simple ANSI color codes for terminal formatting
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

const FETCH_ATTEMPTS = 4;

async function fetchJsonOnce(page, url) {
  // A JSON document has nothing to wait for after the response arrives, so don't wait for network idle.
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  if (!response || !response.ok()) {
    throw new Error(`Failed to fetch ${url}. Status: ${response?.status()}`);
  }
  const contentType = response.headers()['content-type'] || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON from ${url}, got content-type: ${contentType}`);
  }
  return response.json();
}

// Retries with a growing delay, since timeouts and rate limits from shared CI runners are usually temporary.
async function fetchJsonFromPage(page, url) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetchJsonOnce(page, url);
    } catch (error) {
      if (attempt >= FETCH_ATTEMPTS) throw error;
      console.warn(`${colors.yellow}   ↻ Attempt ${attempt}/${FETCH_ATTEMPTS} failed for ${url}: ${error.message.split('\n')[0]}${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, attempt * 2000));
    }
  }
}

async function getImageDimensions(page, imageUrl) {
  try {
    return await page.evaluate(async (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: null, height: null });
        img.src = url;
      });
    }, imageUrl);
  } catch (error) {
    return { width: null, height: null };
  }
}

// Pulls the iframe src out of an ArtStation `player_embedded` snippet and decodes its HTML entities.
function getEmbedSrc(playerEmbedded) {
  const match = playerEmbedded?.match(/src=["']([^"']+)["']/);
  return match ? match[1].replace(/&amp;/g, '&') : null;
}

// ArtStation's video thumbnail is only 295px wide; Vimeo's oEmbed returns a much larger one.
async function getVimeoPoster(context, embedSrc) {
  const videoId = embedSrc.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1];
  if (!videoId) return null;
  try {
    const response = await context.request.get(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${videoId}`)}&width=1920`
    );
    if (!response.ok()) return null;
    const data = await response.json();
    if (!data.thumbnail_url) return null;
    return {
      url: data.thumbnail_url,
      width: data.thumbnail_width || null,
      height: data.thumbnail_height || null
    };
  } catch (error) {
    return null;
  }
}

async function fetchArtStationPortfolio(username) {
  const listUrl = `https://www.artstation.com/users/${username}/projects.json`;
  
  console.log(`\n${colors.bright}${colors.cyan}🚀 Initiating ArtStation Scraper for: ${colors.yellow}@${username}${colors.reset}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Anything that would leave the portfolio incomplete is recorded here; the file is only written if this stays empty.
  const problems = [];
  const reportProblem = (message) => {
    problems.push(message);
    console.warn(`${colors.red}⚠️  ${message}${colors.reset}`);
  };

  try {
    // 1. Fetch user's albums mapping
    console.log(`${colors.blue}📂 Mapping user albums...${colors.reset}`);
    const quickUrl = `https://www.artstation.com/users/${username}/quick.json`;
    let quickData = {};
    try {
      quickData = await fetchJsonFromPage(page, quickUrl);
    } catch (err) {
      reportProblem(`Could not fetch albums (quick.json): ${err.message}`);
    }
    
    // Parse the correct property from quick.json
    const rawAlbums = quickData.albums_with_community_projects || quickData.portfolio_display_settings_albums || [];
    
    // Filter out the default "All" category so we only map custom albums (e.g. "Renders", "Print", etc.)
    const customAlbums = rawAlbums.filter(album => album.album_type === 'custom');
    
    const projectAlbumsMap = {}; // Maps hash_id -> [Album Titles]
    
    if (customAlbums.length > 0) {
      console.log(`${colors.dim}   ↳ Found ${customAlbums.length} custom albums: ${customAlbums.map(a => `"${a.title}"`).join(', ')}${colors.reset}\n`);
      
      for (const album of customAlbums) {
        let pageNum = 1;
        let hasMore = true;
        
        while (hasMore) {
          const albumProjectsUrl = `https://www.artstation.com/users/${username}/projects.json?album_id=${album.id}&page=${pageNum}`;
          try {
            const albumData = await fetchJsonFromPage(page, albumProjectsUrl);
            const albumProjects = albumData.data || [];
            
            if (albumProjects.length === 0) {
              hasMore = false;
            } else {
              for (const proj of albumProjects) {
                if (!projectAlbumsMap[proj.hash_id]) {
                  projectAlbumsMap[proj.hash_id] = [];
                }
                // Avoid duplicates if a project appears on multiple pages
                if (!projectAlbumsMap[proj.hash_id].includes(album.title)) {
                  projectAlbumsMap[proj.hash_id].push(album.title);
                }
              }
              pageNum++;
            }
          } catch (err) {
            reportProblem(`Could not fetch page ${pageNum} of album "${album.title}": ${err.message}`);
            hasMore = false;
          }
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } else {
      console.log(`${colors.dim}   ↳ No custom albums found.${colors.reset}\n`);
    }

    // 2. Fetch the user's main project index
    console.log(`${colors.blue}📥 Fetching main project index...${colors.reset}\n`);
    const listData = await fetchJsonFromPage(page, listUrl);
    const projects = listData.data;
    if (!Array.isArray(projects) || projects.length === 0) {
      throw new Error('The project index is empty.');
    }
    if (listData.total_count && listData.total_count !== projects.length) {
      reportProblem(`The index returned ${projects.length} of ${listData.total_count} projects (more pages?).`);
    }
    const fullPortfolio = [];

    console.log(`${colors.green}✅ Successfully fetched index! Found ${colors.bright}${projects.length}${colors.reset}${colors.green} projects.${colors.reset}\n`);
    console.log(`${colors.blue}📥 Beginning detailed data extraction...${colors.reset}\n`);

    // 3. Loop through each project to fetch its individual JSON data
    for (let i = 0; i < projects.length; i++) {
      const projectMeta = projects[i];
      const hashId = projectMeta.hash_id;
      const detailUrl = `https://www.artstation.com/projects/${hashId}.json`;

      // Progress indicator
      const progress = `[${i + 1}/${projects.length}]`;
      console.log(`${colors.dim}${progress}${colors.reset} 🖼️  Fetching: ${colors.bright}"${projectMeta.title}"${colors.reset}`);

      let detailData;
      try {
        detailData = await fetchJsonFromPage(page, detailUrl);
      } catch (err) {
        reportProblem(`Failed to fetch details for "${projectMeta.title}" (${hashId}): ${err.message}`);
        continue;
      }

      // Extract images and videos in the order ArtStation shows them. Covers and ArtStation-hosted
      // video clips (`video_clip`) are left out.
      const media = [];
      const orderedAssets = [...(detailData.assets || [])].sort((a, b) => a.position - b.position);
      for (const asset of orderedAssets) {
        if (asset.asset_type === 'image') {
          media.push({
            type: 'image',
            url: asset.image_url,
            width: asset.width || null,
            height: asset.height || null
          });
        } else if (asset.asset_type === 'video') {
          const embedSrc = getEmbedSrc(asset.player_embedded);
          if (!embedSrc) {
            reportProblem(`Video asset ${asset.id} in "${projectMeta.title}" (${hashId}) has no embed URL.`);
            continue;
          }
          const poster = (await getVimeoPoster(context, embedSrc)) || {
            url: asset.image_url,
            width: asset.width || null,
            height: asset.height || null
          };
          media.push({ type: 'video', url: embedSrc, poster });
        }
      }

      // Extract tools/software
      const tools = detailData.software_items
        ?.map(software => software.name) || [];

      // Extract categories directly into an array
      const categories = detailData.categories
        ?.map(cat => cat.name) || [];

      // Format date to YYYY-MM-DD
      const formattedDate = detailData.published_at 
        ? detailData.published_at.split('T')[0] 
        : null;

      const thumbnailUrl = detailData.cover_url || projectMeta.cover?.large_image_url;
      let thumbWidth = detailData.cover_width || projectMeta.cover?.width || null;
      let thumbHeight = detailData.cover_height || projectMeta.cover?.height || null;

      if (!thumbnailUrl) {
        reportProblem(`"${projectMeta.title}" (${hashId}) has no thumbnail.`);
      }

      // If dimensions are missing, use Playwright to measure the image
      if (thumbnailUrl && (!thumbWidth || !thumbHeight)) {
        const dims = await getImageDimensions(page, thumbnailUrl);
        thumbWidth = dims.width;
        thumbHeight = dims.height;
      }

      // 4. Map the data to the final schema
      const formattedProject = {
        id: hashId,
        title: detailData.title,
        date: formattedDate,
        albums: projectAlbumsMap[hashId] || [],
        categories: categories, 
        tags: detailData.tags || [],
        
        thumbnail: {
          url: thumbnailUrl,
          width: thumbWidth,
          height: thumbHeight
        },
        
        media: media,
        sourceUrl: detailData.permalink,
        tools: tools,
        description: detailData.description || "", 
        featured: detailData.editor_pick || false,
        order: i + 1,
        
        // Extra useful data
        stats: {
          views: detailData.views_count || 0,
          likes: detailData.likes_count || 0,
          comments: detailData.comments_count || 0
        }
      };

      fullPortfolio.push(formattedProject);

      // Polite delay (500ms) to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (problems.length > 0) {
      console.error(`\n${colors.red}❌ ${problems.length} problem(s) found, so the portfolio file was not updated:${colors.reset}`);
      problems.forEach(message => console.error(`   - ${message}`));
      process.exitCode = 1;
      return;
    }

    return fullPortfolio;

  } catch (error) {
    console.error(`\n${colors.red}❌ Error fetching portfolio:${colors.reset}`, error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

// Execute the function and save the output
fetchArtStationPortfolio("jmr_visuals").then(data => {
  if (data) {
    const filename = `src/content/projects.json`;
    
    // Ensure the output directory exists
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`\n${colors.bright}${colors.green}🎉 Success! Saved ${data.length} projects to 📄 ${filename}${colors.reset}\n`);
  }
});
