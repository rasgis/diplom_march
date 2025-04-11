import styles from "./AnimationText.module.css";

export const AnimationText = () => {
  return (
    <div className={styles.container}>
      <svg viewBox="0 0 1400 200" className={styles.svg}>
        <text x="50%" y="50%" textAnchor="middle" className={styles.text}>
          Добро пожаловать в Stroy City!
        </text>
      </svg>
    </div>
  );
};
