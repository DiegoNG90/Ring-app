import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

async function NotFound() {
  return (
    <main className="not-found">
      <h1>Not Found</h1>
      <p>Unfortunately, we couldnt find the requested page</p>

      <Link href="/">
        <Button className="bg-orange-600" variant="ghost">
          Back
        </Button>
      </Link>
    </main>
  );
}

export default NotFound;
