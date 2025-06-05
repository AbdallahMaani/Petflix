import React, { Suspense, lazy } from 'react';

const Coverpage = lazy(() => import('../Components/CoverPages/CoverPage.jsx'));
const Footer = lazy(() => import('../Components/Footer/Footer.jsx'));

const Articles = () => {
  return (
    <Suspense fallback={<div style={{textAlign: 'center', margin: '2rem'}}>Loading...</div>}>
      <div>
        <Coverpage />
      </div>
      <Footer />
    </Suspense>
  );
};

export default Articles;