import { motion } from 'framer-motion';

export function Scene4() {
  const features = [
    { text: "Bridge Assets", delay: 0.8 },
    { text: "Swap Tokens", delay: 1.0 },
    { text: "Track Live Prices", delay: 1.2 }
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center w-full h-full"
      initial={{ opacity: 0, scale: 1.2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: "-100%" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-[#FBCFE8] opacity-50"></div>
      
      <div className="z-10 w-full flex flex-col items-center justify-center relative">
        <motion.div
          initial={{ y: "10vh", opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] z-0 opacity-80"
        >
          <motion.img
            src={`${import.meta.env.BASE_URL}images/cotton-candy-cloud.png`}
            alt="Cotton Candy Cloud"
            className="w-full h-full object-contain drop-shadow-2xl mix-blend-multiply"
            animate={{
              y: [-10, 10, -10],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        <div className="z-10 flex flex-col items-center text-center mt-[5vh]">
          <div className="overflow-hidden mb-[6vh]">
            <motion.h2
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="text-[5vw] leading-tight font-display font-bold text-[#831843] bg-white/70 backdrop-blur-md px-[3vw] py-[1vh] rounded-3xl shadow-lg border-2 border-white m-0"
            >
              All in one sweet place.
            </motion.h2>
          </div>

          <div className="flex gap-[3vw] relative z-20">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, rotate: -10 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ 
                  duration: 0.6, 
                  type: "spring",
                  stiffness: 200,
                  delay: feature.delay 
                }}
                className="bg-[#FF1493] text-white font-display font-bold text-[2.5vw] px-[2.5vw] py-[2vh] rounded-2xl shadow-[0_10px_20px_rgba(255,20,147,0.3)] border-[3px] border-[#FBCFE8]"
                whileHover={{ y: -10, scale: 1.05 }}
              >
                {feature.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}