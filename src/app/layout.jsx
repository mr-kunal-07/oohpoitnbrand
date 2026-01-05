import "./globals.css";


export const metadata = {
  title: "OOH POINT",
  description: "OOHPOINT Brand",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
