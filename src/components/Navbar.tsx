import Link from "next/link";

type NavLink = {
  href: string;
  label: string;
  primary?: boolean;
};

type NavbarProps = {
  links?: NavLink[];
};

export default function Navbar({ links = [] }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between border-b bg-[#B80050]">
      <img
        alt="Sheffield Hallam: Knowledge Applied"
        className="w-30 md:w-35 lg:w-40"
        src="/SHU_logo_bnw.png"
      />

      <div className="flex items-end h-full pr-4 pb-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-4 py-3 font-bold text-white transition
              ${link.primary
                ? "bg-pink-950 hover:bg-pink-900 ml-10"
                : "hover:bg-pink-900"
              }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}