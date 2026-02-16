import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  const [direction, setDirection] = useState(null);
  const [isMilestone, setIsMilestone] = useState(false);
  const [particles, setParticles] = useState([]);

  const triggerAnimation = (dir) => {
    setDirection(dir);
    setTimeout(() => setDirection(null), 500);
  };

  const createParticles = (type) => {
    const newParticles = [];
    const particleCount = type === "reset" ? 12 : 8;
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: Math.random(),
        angle: (360 / particleCount) * i,
        type,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  };

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    triggerAnimation("up");
    createParticles("up");
    if (newCount % 10 === 0) {
      setIsMilestone(true);
      setTimeout(() => setIsMilestone(false), 800);
    }
  };

  const decrement = () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      triggerAnimation("down");
      createParticles("down");
      if (newCount === 0) {
        setIsMilestone(true);
        setTimeout(() => setIsMilestone(false), 800);
      }
    }
  };

  const reset = () => {
    setCount(0);
    triggerAnimation("reset");
    createParticles("reset");
    setIsMilestone(true);
    setTimeout(() => setIsMilestone(false), 800);
  };

  const getMessage = () => {
    if (count === 0) return "🎯 Back to zero!";
    if (count % 10 === 0 && count > 0) return `🚀 Milestone: ${count}!`;
    return "";
  };

  const displayClass = `count-display ${direction ? `bounce-${direction}` : ""}${isMilestone ? " milestone-flash" : ""}`;

  return (
    <div className="counter-container">
      <div className="particle-field">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`particle particle-${p.type}`}
            style={{
              "--angle": p.angle,
            }}
          />
        ))}
      </div>

      <h2>Counter Application</h2>
      <div className="count-wrapper">
        <h1 className={displayClass}>{count}</h1>
        <div className="glow-ring"></div>
      </div>
      {getMessage() && <p className={`milestone-message ${isMilestone ? "milestone-pop" : ""}`}>{getMessage()}</p>}

      <div className="btn-row">
        <button className="btn btn-primary" onClick={increment} aria-label="increment">
          <span className="btn-icon">+</span> Increment
          <span className="btn-glow"></span>
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={decrement} 
          disabled={count === 0}
          aria-label="decrement"
        >
          <span className="btn-icon">−</span> Decrement
          <span className="btn-glow"></span>
        </button>
        <button className="btn btn-reset" onClick={reset} aria-label="reset">
          Reset
          <span className="btn-glow"></span>
        </button>
      </div>
    </div>
  );
}

export default Counter;