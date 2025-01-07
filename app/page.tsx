import Link from "next/link";

function Home() {
  return (
    <div>
      <h1>Welcome to the Home Page!</h1>
      <Link href="/about"> Go to About Us </Link>
      <Link href="/blog/al7an"> Al7an Section </Link>
      <Link href="/blog/tranim"> Tranim Section </Link>
      <Link href="/blog/w3zat"> W3zat Section </Link>
    </div>
  );
}

export default Home;
