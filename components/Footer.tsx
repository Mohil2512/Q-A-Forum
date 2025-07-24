import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-black/80 border-t border-[#2e236c] shadow-lg mt-8">
      <div className="container-responsive flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-2 mx-auto">
        <div className="text-[#c8acd6] text-lg font-semibold">Anjaneya Corp.</div>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <span className="text-[#c8acd6] font-medium mb-2 md:mb-0">Join Us:</span>
          <a href="https://www.linkedin.com/in/mohil-pipaliya/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#17153b] hover:bg-[#2e236c] rounded-lg px-4 py-2 shadow hover:shadow-lg transition">
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 50 50" fill="none"><rect width="50" height="50" rx="12" fill="#18181b"/><path d="M15.5 20.5V34.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/><circle cx="15.5" cy="16.5" r="2" fill="#fff"/><path d="M22 25.5V34.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/><path d="M22 28.5C22 26.0147 24.0147 24 26.5 24C28.9853 24 31 26.0147 31 28.5V34.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </span>
            <span className="text-white font-semibold">LinkedIn</span>
          </a>
          <a href="https://github.com/Mohil2512" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#17153b] hover:bg-[#2e236c] rounded-lg px-4 py-2 shadow hover:shadow-lg transition">
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-black">
              {/* Official GitHub Mark */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.203 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.847-2.338 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
            </span>
            <span className="text-white font-semibold">GitHub</span>
          </a>
          <a href="https://discord.gg/zDnFfbuJVN" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#17153b] hover:bg-[#2e236c] rounded-lg px-4 py-2 shadow hover:shadow-lg transition">
            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-black">
              {/* Official Discord Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20.317 4.369A19.791 19.791 0 0016.885 3.1a.074.074 0 00-.079.037c-.34.607-.719 1.396-.984 2.013a18.524 18.524 0 00-5.664 0 12.51 12.51 0 00-.997-2.013.077.077 0 00-.079-.037A19.736 19.736 0 003.684 4.369a.069.069 0 00-.032.027C.533 9.09-.32 13.579.099 18.021a.08.08 0 00.031.056c2.104 1.547 4.13 2.488 6.102 3.115a.077.077 0 00.084-.027c.472-.65.892-1.34 1.245-2.065a.076.076 0 00-.041-.104c-.662-.251-1.293-.549-1.905-.892a.077.077 0 01-.008-.127c.128-.096.256-.197.378-.299a.074.074 0 01.077-.01c3.967 1.813 8.27 1.813 12.199 0a.073.073 0 01.078.009c.122.102.25.203.378.299a.077.077 0 01-.006.127 12.298 12.298 0 01-1.906.892.076.076 0 00-.04.105c.36.724.78 1.414 1.244 2.064a.076.076 0 00.084.028c1.978-.627 4.004-1.568 6.107-3.115a.077.077 0 00.03-.055c.5-5.177-.838-9.637-3.549-13.625a.061.061 0 00-.03-.028zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/></svg>
            </span>
            <span className="text-white font-semibold">Discord</span>
          </a>
        </div>
      </div>
    </footer>
  );
} 