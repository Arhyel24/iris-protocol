import { motion } from "framer-motion";

export const MovingGradient = () => {
  return (
    <motion.div
      animate={{
        background: [
          "radial-gradient(circle at 0% 0%, #8B5CF6 0%, transparent 50%)",
          "radial-gradient(circle at 100% 100%, #8B5CF6 0%, transparent 50%)",
          "radial-gradient(circle at 0% 100%, #8B5CF6 0%, transparent 50%)",
          "radial-gradient(circle at 100% 0%, #8B5CF6 0%, transparent 50%)",
          "radial-gradient(circle at 0% 0%, #8B5CF6 0%, transparent 50%)",
        ],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="absolute inset-0 z-0 opacity-30"
    />
  );
};
