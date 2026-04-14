const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] === 'real' ? '5173' : '5174';
const BASE_URL = `http://localhost:${PORT}`;
const FOLDER_NAME = process.argv[2] === 'real' ? 'real' : 'mockup';

const SCREENSHOT_DIR = path.join(__dirname, FOLDER_NAME);

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function takeScreenshot(page, filename, options = {}) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: options.fullPage || false });
  console.log(`Saved: ${filePath}`);
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log(`Starting to take screenshots for ${FOLDER_NAME} at ${BASE_URL}...`);
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Landing Page
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await wait(2000);
    await takeScreenshot(page, 'Gambar_01_Landing_Page.png', { fullPage: true });

    // 2. Login Page - Click Login Button on Landing
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginBtn = buttons.find(b => b.textContent && b.textContent.includes('Login Sistem') || b.textContent.includes('Masuk'));
      if(loginBtn) loginBtn.click();
    });
    await wait(1500);
    await takeScreenshot(page, 'Gambar_02_Halaman_Login.png');

    // 3. Register Page
    await page.evaluate(() => {
      const registerLinks = Array.from(document.querySelectorAll('a, button, span')).filter(el => el.textContent && el.textContent.includes('Daftar di sini'));
      if (registerLinks.length > 0) registerLinks[registerLinks.length-1].click();
    });
    await wait(1000);
    await takeScreenshot(page, 'Gambar_03_Halaman_Register.png');

    // ==========================================
    // MOCK LOGIN AS MANAJER
    // ==========================================
    await page.goto(`${BASE_URL}?role=manajer`, { waitUntil: 'networkidle2' });
    await wait(4000); // Tunggu fetching data selesai

    // Dashboard Manajer
    await takeScreenshot(page, 'Gambar_06_Dashboard_Utama_Manajer.png', { fullPage: true });

    // scroll bawah ke tabel moora
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await wait(1000);
    await takeScreenshot(page, 'Gambar_07_Tabel_Analisis_MOORA.png');

    // ==========================================
    // PROGRAM
    // ==========================================
    await page.goto(`${BASE_URL}?role=manajer`, { waitUntil: 'networkidle2' });
    await wait(3000);
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent && b.textContent.includes('Program') && !b.textContent.includes('Tambah'));
        if(target) target.click();
    });
    await wait(2000);
    await takeScreenshot(page, 'Gambar_08_Daftar_Program_Bantuan.png');

    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent && b.textContent.includes('Tambah Program'));
        if(target) target.click();
    });
    await wait(1500);
    await takeScreenshot(page, 'Gambar_09_Dialog_Tambah_Program.png');
    await page.keyboard.press('Escape');
    await wait(1000);

    // ==========================================
    // MUSTAHIK
    // ==========================================
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent === 'Mustahik');
        if(target) target.click();
    });
    await wait(2000);
    await takeScreenshot(page, 'Gambar_14_Daftar_Mustahik.png');

    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent && b.textContent.includes('Tambah Mustahik'));
        if(target) target.click();
    });
    await wait(1500);
    await takeScreenshot(page, 'Gambar_15_Dialog_Tambah_Mustahik.png');
    await page.keyboard.press('Escape');
    await wait(1000);

    // ==========================================
    // MONITORING
    // ==========================================
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent === 'Monitoring');
        if(target) target.click();
    });
    await wait(2000);
    await takeScreenshot(page, 'Gambar_21_Daftar_Riwayat_Monitoring.png');

    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent && b.textContent.includes('Tambah Data Monitoring'));
        if(target) target.click();
    });
    await wait(1500);
    await takeScreenshot(page, 'Gambar_22_Form_Tambah_Monitoring.png');
    await page.keyboard.press('Escape');
    await wait(1000);

    // ==========================================
    // TRACKING
    // ==========================================
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent === 'Tracking');
        if(target) target.click();
    });
    await wait(2000);
    await takeScreenshot(page, 'Gambar_24_Halaman_Tracking_Riwayat_Penerimaan.png');

    // ==========================================
    // KRITERIA
    // ==========================================
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent === 'Kriteria');
        if(target) target.click();
    });
    await wait(2000);
    await takeScreenshot(page, 'Gambar_25_Halaman_Informasi_Kriteria.png');

    // ==========================================
    // PENGGUNA
    // ==========================================
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent === 'Pengguna');
        if(target) target.click();
    });
    await wait(2000);
    await takeScreenshot(page, 'Gambar_27_Daftar_Pengguna.png');

    // ==========================================
    // MUZAKKI DATABASE
    // ==========================================
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent === 'Muzakki');
        if(target) target.click();
    });
    await wait(2000);
    await takeScreenshot(page, 'Gambar_31_Daftar_Muzakki.png');

    // ==========================================
    // LOGIN AS LLAIN
    // ==========================================
    await page.goto(`${BASE_URL}?role=surveyor`, { waitUntil: 'networkidle2' });
    await wait(4000);
    await takeScreenshot(page, 'Gambar_35_Dashboard_Surveyor.png', { fullPage: true });

    await page.goto(`${BASE_URL}?role=mustahik`, { waitUntil: 'networkidle2' });
    await wait(4000);
    await takeScreenshot(page, 'Gambar_37_Dashboard_Mustahik.png', { fullPage: true });

    await page.goto(`${BASE_URL}?role=muzakki`, { waitUntil: 'networkidle2' });
    await wait(4000);
    await takeScreenshot(page, 'Gambar_41_Dashboard_Muzakki.png', { fullPage: true });

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
    console.log(`Done taking screenshots for ${FOLDER_NAME}!`);
  }
}

run();
