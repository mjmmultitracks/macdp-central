// Criptografa um arquivo (AES-256-GCM) para ser guardado no repositório sem expor o conteúdo.
// Uso: node scripts/encrypt-file.mjs <arquivo.pdf> <saida.enc> <chave-hex-64>
import fs from 'node:fs';
import crypto from 'node:crypto';

const [input, output, keyHex] = process.argv.slice(2);
if (!input || !output || !/^[0-9a-f]{64}$/i.test(keyHex || '')) {
  console.error('Uso: node scripts/encrypt-file.mjs <arquivo> <saida.enc> <chave-hex-64>');
  process.exit(1);
}
const key = Buffer.from(keyHex, 'hex');
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const data = Buffer.concat([cipher.update(fs.readFileSync(input)), cipher.final()]);
// Formato: [12 bytes IV][16 bytes tag][dados]
fs.writeFileSync(output, Buffer.concat([iv, cipher.getAuthTag(), data]));
console.log(`Arquivo criptografado: ${output} (${fs.statSync(output).size} bytes)`);
