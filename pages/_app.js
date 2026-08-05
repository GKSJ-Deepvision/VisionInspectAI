import Head from 'next/head';
import { useRouter } from 'next/router';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>VisionInspect AI</title>
        <meta
          name="description"
          content="AI-powered manufacturing defect detection and quality inspection platform."
        />
      </Head>
      <div key={router.pathname} className="page-fade">
        <Component {...pageProps} />
      </div>
    </>
  );
}
