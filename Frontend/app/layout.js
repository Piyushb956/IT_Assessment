import "./globals.css";

export const metadata = {
  title: "Salarite HR",
  description: "Virtual HR task and interview dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-violet-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        </div>
        {children}
      </body>
    </html>
  );
}