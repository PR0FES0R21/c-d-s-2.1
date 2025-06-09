import React, { useState, useEffect } from 'react';

// Daftar karakter yang mungkin muncul di teks acak
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*&%$#@!?<>[]{}()-_+=~/\\|';
// Daftar kata yang mungkin "ter-decode"
const DECODED_WORDS = ['SYSTEM', 'STABLE', 'ONLINE', 'CIGAR', 'SECURE', 'NOMINAL', 'ACTIVE', 'RDY', 'SCAN'];

// KONFIGURASI TINGGI GIMMICK:
// Sesuaikan class Tailwind ini untuk tinggi total TerminalScanner.
const GIMMICK_HEIGHT_CLASS = 'h-[80px]'; // Ganti sesuai kebutuhan tinggi total gimmick

const TerminalScanner: React.FC = () => {
  const [decodedText, setDecodedText] = useState<string>('');

  // Efek untuk teks decoding
  useEffect(() => {
    const generateRandomChars = (length: number) => {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
      }
      return result;
    };

    let animationFrameId: number;
    let charCount = 0;
    const maxChars = 12; // Jumlah maksimal karakter untuk tampilan teks decode
    let currentWord = '';
    let wordDisplayCounter = 0;
    const wordDisplayDuration = 25; // Berapa frame kata "decoded" akan ditampilkan
    let currentRandomText = generateRandomChars(maxChars);

    const updateText = () => {
      if (wordDisplayCounter > 0) {
        // Menampilkan kata yang "ter-decode"
        const paddingLength = Math.floor((maxChars - currentWord.length) / 2);
        const padding = ' '.repeat(Math.max(0, paddingLength));
        setDecodedText(`${padding}${currentWord}${padding}`.slice(0, maxChars));
        wordDisplayCounter--;
      } else if (Math.random() < 0.015) { // Peluang untuk "men-decode" kata baru
        currentWord = DECODED_WORDS[Math.floor(Math.random() * DECODED_WORDS.length)];
        wordDisplayCounter = wordDisplayDuration;
        charCount = 0; // Reset hitungan karakter acak
      } else {
        // Menampilkan karakter acak dengan efek "mengetik"
        if (charCount < maxChars) {
            currentRandomText = generateRandomChars(charCount + 1) + currentRandomText.slice(charCount + 1);
            charCount++;
        } else {
            // Jika sudah penuh, ganti semua dengan karakter acak baru
            currentRandomText = generateRandomChars(maxChars);
            charCount = Math.floor(Math.random() * maxChars / 3); // Reset sebagian untuk efek ketik lagi
        }
        setDecodedText(currentRandomText.slice(0, maxChars));
      }
      animationFrameId = requestAnimationFrame(updateText);
    };

    animationFrameId = requestAnimationFrame(updateText);
    return () => cancelAnimationFrame(animationFrameId); // Cleanup saat komponen unmount
  }, []);

  return (
    // Kontainer utama untuk gimmick scanner
    <div className={`flex items-center ${GIMMICK_HEIGHT_CLASS} w-full text-xs font-mono select-none overflow-hidden`}>
      {/* Bagian Kiri: Radar (mengambil 40% lebar) */}
      <div className="w-[40%] h-full flex items-center justify-center pr-2">
        {/* Kontainer visual radar, tinggi 95% dari parent, aspek rasio persegi, dengan border dan animasi pulse */}
        <div
          className="relative h-[95%] aspect-square border border-cyan-500/50 rounded-full animate-radar-pulse overflow-hidden"
        >
          {/* Kontainer untuk efek ping/blip radar */}
          <div className="absolute w-full h-full radar-ping-container">
            {/* Contoh elemen ping. Bisa ditambah lebih banyak dengan style dan delay berbeda. */}
            <div className="absolute radar-ping" style={{ top: '30%', left: '30%', width: '60%', height: '60%' }}></div>
            <div className="absolute radar-ping radar-ping-delay-1" style={{ top: '55%', left: '60%', width: '45%', height: '45%' }}></div>
            <div className="absolute radar-ping radar-ping-delay-2" style={{ top: '15%', left: '50%', width: '35%', height: '35%' }}></div>
          </div>

          {/* Kontainer untuk efek sweep radar yang ditingkatkan (gradien dan garis) */}
          <div className="absolute inset-0 radar-sweep-enhanced">
            <div className="radar-sweep-gradient-area"></div> {/* Area gradien berwarna */}
            <div className="radar-sweep-line-visual"></div> {/* Garis sweep visual */}
          </div>

          {/* Dot radar statis dengan animasi blink (opsional, jika masih ingin dipertahankan) */}
          <div
            className="absolute bg-green-400 rounded-full radar-dot"
            style={{
              width: '8%', height: '8%', top: '25%', left: '75%', zIndex: 3,
            }}
          ></div>
          <div
            className="absolute bg-purple-400/80 rounded-full radar-dot-alt"
            style={{
              width: '10%', height: '10%', top: '65%', left: '20%', zIndex: 3,
            }}
          ></div>
        </div>
      </div>

      {/* Bagian Kanan: Animasi Scan Bar dan Teks Decode (mengambil 60% lebar) */}
      <div className="w-[60%] h-full flex flex-col justify-around pl-2 border-l border-gray-700/50">
        {/* Kontainer untuk animasi scan bar */}
        <div className="w-full h-[45%] relative overflow-hidden bg-gray-800/30 flex items-center">
            {/* PERUBAHAN DI SINI: Ganti h-full dengan tinggi spesifik yang lebih kecil */}
            <div className="w-1/5 h-1/4 bg-green-400/80 animate-scanner-bar-v2"></div> {/* Contoh: h-[3px] */}
        </div>
        {/* Kontainer untuk teks decode */}
        <div className="w-full h-[45%] text-green-400 flex items-center justify-center">
          <span className="truncate">{decodedText}</span> {/* Teks decode, truncate jika terlalu panjang */}
        </div>
      </div>
    </div>
  );
};

export default TerminalScanner;
