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

async function fetchJsonFromPage(page, url) {
  const response = await page.goto(url, {
    waitUntil: 'networkidle',
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

async function fetchArtStationPortfolio(username) {
  const listUrl = `https://www.artstation.com/users/${username}/projects.json`;
  
  console.log(`\n${colors.bright}${colors.cyan}🚀 Initiating ArtStation Scraper for: ${colors.yellow}@${username}${colors.reset}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    // 1. Fetch user's albums mapping
    console.log(`${colors.blue}📂 Mapping user albums...${colors.reset}`);
    const quickUrl = `https://www.artstation.com/users/${username}/quick.json`;
    let quickData = {};
    try {
      quickData = await fetchJsonFromPage(page, quickUrl);
    } catch (err) {
      console.warn(`${colors.yellow}⚠️  Warning: Could not fetch albums (quick.json). Albums will be empty.${colors.reset}`);
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
        console.warn(`${colors.red}⚠️  Warning: Failed to fetch details for ${hashId}. Skipping...${colors.reset}`);
        continue;
      }

      // Extract high-res image URLs from the assets array
      const images = detailData.assets
        ?.filter(asset => asset.asset_type === 'image')
        .map(asset => asset.image_url) || [];

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

      // 4. Map the data to the final schema
      const formattedProject = {
        id: hashId,
        title: detailData.title,
        date: formattedDate,
        albums: projectAlbumsMap[hashId] || [],
        categories: categories, 
        tags: detailData.tags || [],
        thumbnail: detailData.cover_url || projectMeta.cover?.large_image_url,
        images: images,
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

    return fullPortfolio;

  } catch (error) {
    console.error(`\n${colors.red}❌ Error fetching portfolio:${colors.reset}`, error);
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
