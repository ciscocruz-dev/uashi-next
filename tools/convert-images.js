const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'img');
const files = ['carro-espuma.jpg', 'frente-loja.png', 'app-celular.png'];

async function convert() {
  for (const file of files) {
    const inPath = path.join(dir, file);
    const outPath = path.join(dir, file.replace(/\.(jpe?g|png)$/i, '.webp'));
    if (!fs.existsSync(inPath)) {
      console.warn('Não encontrado:', inPath);
      continue;
    }
    try {
      await sharp(inPath)
        .webp({ quality: 80 })
        .toFile(outPath);
      console.log('Convertido:', file, '→', path.basename(outPath));
    } catch (err) {
      console.error('Erro convertendo', file, err);
    }
  }
}

convert();
