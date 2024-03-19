// txt dosyası içerisindeki  birden fazla boşlukları kaldırmakve yenibir txt dosyası oluşturmak için kullanılır.
 

const fs = require('fs');
const path = require('path');
  function removeExtraSpaces(inputFilePath, outputFilePath) {
  const input = fs.readFileSync(inputFilePath, 'utf8');
  const output = input.replace(/\s+/g, '\n');
  fs.writeFileSync(outputFilePath, output);
}
 removeExtraSpaces('./tr.txt', './tr1.txt');    
