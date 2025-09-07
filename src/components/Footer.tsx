export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-16">
      {/* Author Introduction */}
      <section className="max-w-2xl mx-auto px-4 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm mb-2">
              제품 만드는 일을 합니다. 일하면 느끼는 것들을 적고 있습니다.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://linkedin.com/in/sonujung" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 text-sm flex items-center gap-1 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              <a 
                href="mailto:iam@sonujung.com" 
                className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.909L12 10.09l9.455-6.269h.909c.904 0 1.636.732 1.636 1.636Z"/>
                </svg>
                Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <p className="text-gray-400 text-sm">
          © 2024 Sonu Jung. 정선우의 블로그입니다.
        </p>
      </div>
    </footer>
  );
}