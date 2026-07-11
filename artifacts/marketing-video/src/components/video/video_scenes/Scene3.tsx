import { motion } from 'framer-motion';

export function Scene3() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-between w-full h-full px-[10vw]"
      initial={{ opacity: 0, clipPath: "circle(0% at 50% 100%)" }}
      animate={{ opacity: 1, clipPath: "circle(150% at 50% 100%)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="z-10 w-1/2 flex flex-col justify-center">
        <div className="overflow-hidden mb-[2vh]">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="inline-block bg-white text-[#FF1493] font-mono font-bold text-[1.8vw] px-[1.5vw] py-[0.5vh] rounded-full border-2 border-[#FF1493] shadow-md uppercase tracking-wider"
          >
            Own by nobody
          </motion.div>
        </div>
        
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%", rotate: 2 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
            className="text-[6.5vw] leading-[1.1] font-display font-bold text-[#831843] drop-shadow-md m-0"
          >
            Zero team.
          </motion.h2>
        </div>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%", rotate: -2 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.0 }}
            className="text-[6.5vw] leading-[1.1] font-display font-bold text-[#FF1493] m-0"
          >
            Only Barbie's.
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-[2.5vw] text-[#831843] font-body font-semibold mt-[3vh] opacity-80"
        >
          Fair launch your dream token in seconds.
        </motion.p>
      </div>

      <div className="z-10 w-1/2 flex justify-center items-center h-full relative">
        {/* Rocket exhaust particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-[20vh] w-[4vw] h-[4vw] bg-white rounded-full mix-blend-overlay"
            initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [0, 2, 3],
              y: [0, 100, 200],
              x: [(i - 2) * 20, (i - 2) * 50, (i - 2) * 80]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          />
        ))}

        <motion.div
          initial={{ y: "50vh", scale: 0.5, rotate: -15 }}
          animate={{ y: ["10vh", "-5vh", "0vh"], scale: 1, rotate: [0, 5, -2, 0] }}
          transition={{ 
            y: { duration: 2, ease: "easeOut" },
            scale: { duration: 1.5, type: "spring" },
            rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative w-[35vw] h-[35vw]"
        >
          <motion.img
            src={`${import.meta.env.BASE_URL}images/pink-rocket.png`}
            alt="Pink Rocket"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}