import sharp from "sharp"
import pngToIco from "png-to-ico"
import fs from "node:fs"

const SRC = "public/logo-white.png"
const BG = "#0a0a0a"

// 1) Crop away every empty margin around the logo, so only the SK mark is left.
//    Without this, the logo sits small inside its own canvas.
const trimmed = await sharp(SRC).trim().toBuffer()

// 2) Dark square, logo scaled to fill `ratio` of it.
//    Big ratio = big logo. Tabs show 16-32px, so small sizes get the biggest fill.
async function makeIcon(size, ratio) {
  const box = Math.round(size * ratio)
  const logo = await sharp(trimmed)
    .resize(box, box, { fit: "inside" })
    .toBuffer()

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer()
}

const icon192 = await makeIcon(192, 0.9)   // Google + Android (192 = 4 x 48)
const apple180 = await makeIcon(180, 0.84) // iPhone home screen
const ico = await pngToIco([
  await makeIcon(16, 1.0),   // tab size: logo touches the edges
  await makeIcon(32, 0.94),
  await makeIcon(48, 0.92),
])

fs.writeFileSync("src/app/icon.png", icon192)
fs.writeFileSync("src/app/apple-icon.png", apple180)
fs.writeFileSync("src/app/favicon.ico", ico)

console.log("Icons written to src/app/")
