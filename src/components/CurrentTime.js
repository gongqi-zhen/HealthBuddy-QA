import {useState, useEffect} from "react";

export default function CurrentTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hour = now.getHours().toString().padStart(2, "0");
      const min = now.getMinutes().toString().padStart(2, "0");
      const sec = now.getSeconds().toString().padStart(2, "0");
      const date = now.getDate();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const year = now.getFullYear();
      const day = ["日", "月", "火", "水", "木", "金", "土"][now.getDay()];
      setTime(`${year}/${month}/${date} (${day}) ${hour}:${min}:${sec}`);
    }, 1000);
    return () => { clearInterval(timer) };
  }, []);

  const element = (
    <span className="time-display">{time}</span>
  );

  return element;
}
