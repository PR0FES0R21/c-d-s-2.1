import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';
// Pastikan nama import ini sesuai dengan nama file komponen gimmick lu
import TerminalScanner from './TerminalScanner'; // atau TerminalGimmick jika masih pakai nama itu

const terminalMessages = [
  // ... (daftar pesan tidak berubah) ...
  { id: 1, text: "Establishing connection to Smoketron outpost...", delay: 1000 },
  { id: 2, text: "Connection secured. Welcome back, operator.", delay: 2000 },
  { id: 3, text: "Systems recovering after Krellnic Inversion event.", delay: 3000 },
  { id: 4, text: "Ecosystem restoration: 37% complete.", delay: 4000 },
  { id: 5, text: "Mining operations: ONLINE", delay: 5000 },
  { id: 6, text: "Token distribution network: STABLE", delay: 6000 },
  { id: 7, text: "Detected 2 unclaimed airdrops in your sector.", delay: 7000 },
  { id: 8, text: "Warning: LP Vault access temporarily restricted.", delay: 8000 },
  { id: 9, text: "DAO Council elections scheduled: T-minus 13 cycles.", delay: 9000 },
  { id: 10, text: "Marketplace reconstruction in progress: 58%.", delay: 10000 },
  { id: 11, text: "Running diagnostic on quantum relays...", delay: 11000 },
  { id: 12, text: "All systems nominal. Standby for further instructions.", delay: 12000 },
];

const MissionLog: React.FC = () => {
  const [visibleMessages, setVisibleMessages] = useState<typeof terminalMessages>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    
    terminalMessages.forEach((message) => {
      const timeout = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, message]);
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, message.delay);
      timeouts.push(timeout);
    });
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);
  
  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/80 border border-purple-500/20 backdrop-blur-sm p-5 h-full flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400"></div>
      
      {/* Bagian Judul */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
          <Terminal size={18} className="text-green-400" />
          System Status
        </h2>
        <div className="text-xs font-mono text-gray-400 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>TERMINAL ACTIVE</span>
        </div>
      </div>
      
      {/* Kotak Terminal Log (tinggi tetap) */}
      <div 
        className="bg-gray-950 rounded-lg border border-gray-800 p-4 h-[250px] font-mono text-sm leading-relaxed flex flex-col overflow-hidden"
      >
        {/* Area Pesan (bisa scroll) */}
        <div 
          ref={messagesContainerRef}
          className="space-y-2 flex-grow overflow-y-auto hide-scrollbar mb-1"
        >
          {visibleMessages.map((message) => (
            <div key={message.id} className="flex">
              <span className="text-green-500 mr-2">&gt;</span>
              <span className="text-gray-400">{message.text}</span>
            </div>
          ))}
          <div className="flex h-5"> {/* Blinking cursor */}
            <span className="text-green-500 mr-2">&gt;</span>
            <span className="w-3 h-5 bg-green-500 animate-pulse"></span>
          </div>
        </div>
      </div>
      
      {/* Kontainer untuk Gimmick (mengisi sisa ruang dan menengahkan) */}
      <div className="flex-grow flex items-center justify-center py-2"> {/* <--- PENYESUAIAN DI SINI */}
        <TerminalScanner /> {/* Komponen gimmick dengan tinggi internalnya sendiri (misal h-[40px]) */}
      </div>
      
      {/* Efek blur dekoratif (absolute, tidak mempengaruhi layout utama) */}
      <div className="absolute bottom-0 right-0 w-full h-40 pointer-events-none opacity-10">
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-green-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
};

export default MissionLog;