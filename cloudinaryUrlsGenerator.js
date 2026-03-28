// run this script from the root of the project
// bash: node cloudinaryUrlsGenerator.js
// generates the cloudinary urls from local IMAGES_DIR to cloudinary FOLDER and saves the urls to URLS_FILE
// MUST HAVE NODE.JS INSTALLED. also, npm install cloudinary & npm install dotenv
// Script adds new URLs to existing JSON file or creates the json file, if it doesn't exist

import { v2 as cloudinary } from 'cloudinary'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

config() // loads .env

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const FOLDER = 'amit-portfolio/screens'
const IMAGES_DIR = './cloudinary/screens'
const URLS_FILE = './public/data/cloudinary-urls.json'

// Load existing URLs if file exists
let urls = {}
if (fs.existsSync(URLS_FILE)) {
    urls = JSON.parse(fs.readFileSync(URLS_FILE, 'utf-8'))
    console.log(`Loaded ${Object.keys(urls).length} existing URLs from ${URLS_FILE}`)
}

let uploaded = 0
let skipped = 0

// Get all .png files in IMAGES_DIR
const files = fs.readdirSync(IMAGES_DIR).filter(f => f.toLowerCase().endsWith('.png'))

for (const filename of files) {
    const name = path.parse(filename).name  // filename without extension

    // Skip if already uploaded
    if (urls[name]) {
        console.log(`  — skipping ${filename} (already uploaded)`)
        skipped++
        continue
    }

    const filepath = path.join(IMAGES_DIR, filename)
    console.log(`Uploading ${filename}...`)

    try {
        const result = await cloudinary.uploader.upload(filepath, {
            folder: FOLDER,
            public_id: name,
            overwrite: false,
            resource_type: 'image'
        })

        urls[name] = result.secure_url
        console.log(`  ✓ ${result.secure_url}`)
        uploaded++
    } catch (e) {
        console.log(`  ✗ ${filename} — ${e.message}`)
    }
}

// Save updated URLs back to JSON
fs.writeFileSync(URLS_FILE, JSON.stringify(urls, null, 4))

console.log(`\nDone! ${uploaded} uploaded, ${skipped} skipped.`)
console.log(`URLs saved to ${URLS_FILE}`)