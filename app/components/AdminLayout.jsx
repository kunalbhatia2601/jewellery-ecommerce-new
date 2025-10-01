"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    const navItems = [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/users', label: 'Users' },
        { path: '/admin/products', label: 'Products' },
        { path: '/admin/orders', label: 'Orders' }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                <aside className="w-64 bg-white shadow-md h-screen fixed">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold text-[#8B6B4C]">Admin Panel</h2>
                    </div>
                    <nav className="p-4">
                        <ul className="space-y-2">
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        className={`flex items-center p-2 rounded transition-colors ${
                                            pathname === item.path
                                                ? 'bg-[#8B6B4C] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
                <main className="ml-64 flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}