// src/components/Preloadera.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Instagram } from 'lucide-react';
import DotGrid from './DotGrid';
import Spline from '@splinetool/react-spline';

const Preloader = ({ onFinished }) => {
  const [typedText, setTypedText] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isAssetLoaded, setIsAssetLoaded] = useState(false);
  const [assetError, setAssetError] = useState(false);
  const fullText = "www.nadhilarsy.com";

  // Efek untuk memunculkan konten setelah jeda singkat
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setShowContent(true);
    }, 500);
    return () => clearTimeout(initialTimer);
  }, []);

  // Efek sebagai pengaman (timeout) jika preloader macet
  useEffect(() => {
    const maxWaitTime = 8000; // Jeda maksimal 8 detik
    const timeoutId = setTimeout(() => {
      if (!fadeOut) {
        console.log('Preloader timeout, forcing transition');
        setFadeOut(true);
        setTimeout(onFinished, 1000);
      }
    }, maxWaitTime);
    return () => clearTimeout(timeoutId);
  }, [fadeOut, onFinished]);

  // Efek utama yang mensinkronkan animasi ketik DAN status loading aset
  useEffect(() => {
    if (showContent) {
      // Logika animasi mengetik
      if (typedText.length < fullText.length) {
        const typingTimer = setTimeout(() => {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }, 120);
        return () => clearTimeout(typingTimer);
      } 
      // Kondisi untuk keluar: Teks selesai diketik DAN aset 3D sudah dimuat
      else if (typedText.length === fullText.length && isAssetLoaded) {
        const exitTimer = setTimeout(() => {
          setFadeOut(true);
          setTimeout(onFinished, 1000); // Tunggu animasi fade-out
        }, 1500); // Jeda setelah semua selesai
        return () => clearTimeout(exitTimer);
      }
    }
  }, [typedText, showContent, fullText, onFinished, isAssetLoaded]);

  // Fungsi yang dipanggil saat aset Spline berhasil dimuat
  const handleAssetLoad = () => {
    console.log('Spline asset loaded successfully');
    setIsAssetLoaded(true);
  };
  
  // Fungsi yang dipanggil saat aset Spline gagal dimuat
  const handleAssetError = (error) => {
    console.error('Spline asset failed to load:', error);
    setAssetError(true);
    setIsAssetLoaded(true); // Tetap dianggap selesai agar preloader tidak macet
  };
  
  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 1, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white bg-[#060010]"
        >
          <DotGrid />

          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
              className="text-center relative z-10 p-4"
            >
              {/* --- BAGIAN SPLINE YANG DIPERBAIKI --- */}
              <div className="flex justify-center mb-2 mt-[-24px] md:mt-[-32px]">
                <div className="w-[320px] h-[180px] md:w-[480px] md:h-[260px] flex items-center justify-center relative bg-transparent">
                  
                  {/* Jika terjadi error, tampilkan pesan error saja */}
                  {assetError && (
                    <div className="text-center text-gray-400">
                      <motion.div className="text-6xl mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>🚀</motion.div>
                      <div className="text-sm">Loading Portfolio...</div>
                    </div>
                  )}

                  {/* Render komponen Spline di belakang. Ini akan selalu dirender agar bisa dimuat. */}
                  {!assetError && (
                    <Spline
                      scene="https://prod.spline.design/FcZ66SFMX1YbF-0I/scene.splinecode"
                      onLoad={handleAssetLoad}
                      onError={handleAssetError}
                    />
                  )}

                  {/* Tampilkan animasi loading ini sebagai LAPISAN DI ATAS Spline. */}
                  <AnimatePresence>
                    {!assetError && !isAssetLoaded && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        // Lapisan ini menutupi Spline yang sedang loading di belakangnya
                        className="absolute inset-0 flex flex-col items-center justify-center bg-[#060010]"
                      >
                        <motion.div 
                          className="text-6xl mb-4" 
                          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          ⚡
                        </motion.div>
                        <div className="text-sm font-cascadia">Loading 3D Robot...</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

              {/* ... sisa kode tidak berubah ... */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.2, ease: "easeOut" } }}
                className="text-4xl md:text-6xl font-moderniz font-bold mb-4"
              >
                Muhammad Nadhil Arsy Al-Wafi
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.8, delay: 0.5 } }}
                className="font-cascadia text-lg md:text-xl text-gray-400 mb-8 break-all"
              >
                <span>{typedText}</span>
                <span className="animate-blink">|</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.8 } }}
                className="flex justify-center gap-6"
              >
                <a href="https://github.com/nadhil13" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffdc] transition-all duration-300 transform hover:scale-110">
                  <Github size={32} />
                </a>
                <a href="https://www.linkedin.com/in/muhammad-nadhil-arsy-al-wafi-b7546125b/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffdc] transition-all duration-300 transform hover:scale-110">
                  <Linkedin size={32} />
                </a>
                <a href="https://www.instagram.com/_ndlasy" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffdc] transition-all duration-300 transform hover:scale-110">
                  <Instagram size={32} />
                </a>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;