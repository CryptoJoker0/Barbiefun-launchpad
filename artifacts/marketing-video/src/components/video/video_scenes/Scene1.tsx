import { motion } from 'framer-motion';

export function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
    >
      <div className="z-10 flex flex-col items-center justify-center text-center w-full">
        <motion.div
          initial={{ scale: 0, rotate: -45, y: 100 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
          className="relative w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] mb-[4vh]"
        >
          <motion.img
            src={`${import.meta.env.BASE_URL}images/barbie-crypto-coin.png`}
            alt="Barbie Coin"
            className="w-full h-full object-contain drop-shadow-2xl"
            animate={{
              y: [0, -15, 0],
              rotateY: [0, 15, 0, -15, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        <div className="flex flex-col items-center">
          <div className="overflow-hidden pb-[1vh]">
            <motion.h1
              initial={{ y: "100%", rotate: 5 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="text-[6vw] leading-none font-display font-bold text-[#FF1493] drop-shadow-lg tracking-tight m-0"
            >
              DeFi Just Got
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%", rotate: -5 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
              className="text-[8vw] leading-none font-display font-bold text-white text-stroke-pink drop-shadow-xl m-0"
            >
              A Makeover.
            </motion.h1>
          </div>
        </div>
      </div>
    </motion.div>
  );
}