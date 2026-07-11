import { motion } from 'framer-motion';

export function Scene2() {
  const launchpads = ["Ethereum", "Base", "Optimism", "Arbitrum", "Polygon", "BSC", "X1", "Solana"];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center w-full h-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="z-10 w-full px-[5vw]">
        <div className="flex flex-col items-start max-w-[80vw]">
          <div className="overflow-hidden mb-[2vh]">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="inline-block bg-[#FF1493] text-white font-mono font-bold text-[2vw] px-[1.5vw] py-[0.5vh] rounded-full uppercase tracking-wider shadow-lg"
            >
              The $5 Flat Fee
            </motion.div>
          </div>
          
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="text-[5vw] leading-tight font-display font-bold text-[#831843] m-0"
            >
              Launch everywhere.
            </motion.h2>
          </div>
          <div className="overflow-hidden mb-[6vh]">
            <motion.h2
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="text-[5vw] leading-tight font-display font-bold text-[#FF1493] m-0"
            >
              Own everything.
            </motion.h2>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-[2vw] w-full max-w-[70vw] mx-auto perspective-[1000px]">
          {launchpads.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut", 
                delay: 0.8 + (i * 0.1) 
              }}
              className="bg-white rounded-2xl p-[1.5vw] shadow-xl border-2 border-[#FBCFE8] flex items-center justify-center transform-gpu"
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-display font-bold text-[#FF1493] text-[1.8vw] drop-shadow-sm">{name}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Decorative midground element */}
      <motion.div
        initial={{ scale: 0, rotate: 90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, type: "spring", delay: 0.6 }}
        className="absolute right-[5vw] bottom-[10vh] w-[20vw] h-[20vw] z-0 opacity-20 pointer-events-none"
      >
         <img
            src={`${import.meta.env.BASE_URL}images/barbie-crypto-coin.png`}
            alt=""
            className="w-full h-full object-contain"
          />
      </motion.div>
    </motion.div>
  );
}