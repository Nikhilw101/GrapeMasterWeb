import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Home, ShoppingCart, User, Store, Package } from 'lucide-react';

/**
 * Mobile-only bottom navigation. Thumb-friendly, fixed at bottom.
 */
export function BottomNav({ cartCount, onCartClick, user }) {
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const navItems = [
        { to: '/', icon: Home, label: 'Home' },
        { to: user ? '/profile?tab=orders' : '/login', icon: Package, label: 'My Orders', isActive: () => location.pathname === '/profile' && searchParams.get('tab') === 'orders' },
        { to: null, icon: ShoppingCart, label: 'Cart', onClick: onCartClick, badge: cartCount },
        { to: '/be-a-dealer', icon: Store, label: 'Dealer' },
        { to: user ? '/profile' : '/login', icon: User, label: user ? 'Profile' : 'Login', isActive: () => location.pathname === '/profile' && searchParams.get('tab') !== 'orders' }
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = item.isActive ? item.isActive() : (item.to && location.pathname === item.to.split('?')[0]);
                    const Icon = item.icon;
                    const content = (
                        <div className="flex flex-col items-center justify-center gap-0.5 py-2 px-4 min-w-[64px]">
                            <span className="relative inline-flex">
                                <Icon className={`w-6 h-6 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                                {item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </span>
                            <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>{item.label}</span>
                        </div>
                    );
                    if (item.onClick) {
                        return (
                            <button key={item.label} type="button" onClick={item.onClick} className="touch-manipulation">
                                {content}
                            </button>
                        );
                    }
                    return (
                        <Link key={item.label} to={item.to} className="touch-manipulation">
                            {content}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export default BottomNav;
