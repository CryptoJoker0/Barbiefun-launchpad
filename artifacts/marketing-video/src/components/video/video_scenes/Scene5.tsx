import { motion } from 'framer-motion';

export function Scene5() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center w-full h-full bg-[#FF1493]"
      initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none mix-blend-overlay"></div>

      <div className="z-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
            delay: 0.4
          }}
          className="relative w-[25vw] h-[25vw] mb-[4vh]"
        >
          <motion.img
            src={`${import.meta.env.BASE_URL}images/barbie-crypto-coin.png`}
            alt="Barbie Coin"
            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        <div className="overflow-hidden mb-[1vh]">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
            className="text-[8vw] leading-none font-display font-bold text-white drop-shadow-xl m-0"
          >
            Barbie Fun
          </motion.h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-[2vh] bg-white text-[#FF1493] font-mono font-bold text-[2vw] px-[3vw] py-[1.5vh] rounded-full shadow-2xl tracking-widest uppercase"
        >
          barbie.fun
        </motion.div>
      </div>
    </motion.div>
  );
}