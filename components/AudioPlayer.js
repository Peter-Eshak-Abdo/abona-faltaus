const AudioPlayer = ({ text }) => {
  const speak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech غير مدعوم في متصفحك");
    }
  };

  return (
    <button onClick={speek} className="ml-2 text-blue-500 hover:text-blue-700">
      🔊 تشغيل
    </button>
  );
};

export default AudioPlayer;
