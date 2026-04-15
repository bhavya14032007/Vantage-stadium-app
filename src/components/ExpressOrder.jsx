/**
 * ExpressOrder — Violet-themed food pre-order interface.
 */
import { useState } from 'react';
import { ShoppingCart, Bell, CheckCircle2, Clock, ChefHat, Plus, Minus, Sparkles, Package } from 'lucide-react';

const MENU = [
  { id: 'm1', name: 'Spicy Loaded Fries',  emoji: '🍟', price: 180, prepTime: 8,  category: 'Snacks' },
  { id: 'm2', name: 'Stadium Burger',       emoji: '🍔', price: 250, prepTime: 12, category: 'Mains'  },
  { id: 'm3', name: 'BBQ Chicken Wings',    emoji: '🍗', price: 220, prepTime: 14, category: 'Mains'  },
  { id: 'm4', name: 'Nachos & Cheese',      emoji: '🧀', price: 150, prepTime: 5,  category: 'Snacks' },
  { id: 'm5', name: 'Cold Brew Coffee',     emoji: '☕', price: 120, prepTime: 3,  category: 'Drinks' },
  { id: 'm6', name: 'Mango Smoothie',       emoji: '🥭', price: 140, prepTime: 4,  category: 'Drinks' },
];

const QUEUE_OFFSET = 6;

const CATEGORY_COLORS = {
  Snacks: { bg:'rgba(217,119,6,0.08)',    color:'var(--color-amber)' },
  Mains:  { bg:'rgba(109,40,217,0.07)',   color:'var(--color-primary)' },
  Drinks: { bg:'rgba(8,145,178,0.08)',    color:'var(--color-teal)' },
};

export default function ExpressOrder({ orders, setOrders }) {
  const [cart, setCart]               = useState({});
  const [tab, setTab]                 = useState('menu');
  const [notification, setNotification] = useState(null);

  const addToCart = (item) => setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  const removeFromCart = (id) => setCart(prev => {
    const n = { ...prev };
    if (n[id] > 1) n[id]--; else delete n[id];
    return n;
  });

  const cartTotal   = Object.entries(cart).reduce((s,[id,qty]) => s + (MENU.find(m=>m.id===id)?.price||0)*qty, 0);
  const cartCount   = Object.values(cart).reduce((s,v)=>s+v, 0);
  const maxPrepTime = Math.max(0, ...Object.keys(cart).map(id => MENU.find(m=>m.id===id)?.prepTime||0));

  const placeOrder = () => {
    if (!cartCount) return;
    const totalTime = maxPrepTime + QUEUE_OFFSET;
    const newOrder = {
      id: `o${Date.now()}`,
      item: Object.keys(cart).length === 1
        ? MENU.find(m => m.id === Object.keys(cart)[0])?.name
        : `${Object.keys(cart).length}-item order`,
      emoji: MENU.find(m => m.id === Object.keys(cart)[0])?.emoji || '🛍️',
      price: cartTotal,
      timeToReady: totalTime,
      totalTime,
      status: 'preparing',
      notified: false,
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart({});
    setTab('orders');
    setNotification('Order placed! We\'ll notify you when it\'s almost ready 🎉');
    setTimeout(() => setNotification(null), 5000);
  };

  const categories = [...new Set(MENU.map(m => m.category))];

  return (
    <section aria-label="Express Ordering">
      {/* Header */}
      <div className="section-header">
        <span className="section-title">Express Order</span>
        <span className="badge badge--violet">
          <Sparkles size={10} /> Skip the Queue
        </span>
      </div>

      {/* Toast */}
      {notification && (
        <div className="card animate-slide-up" style={{ marginBottom:'var(--space-2)', borderColor:'rgba(5,150,105,0.3)', background:'rgba(5,150,105,0.06)', padding:'var(--space-1) var(--space-2)' }} role="alert">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} color="var(--color-green)" />
            <p style={{ fontSize:'0.8rem', color:'var(--color-text-primary)' }}>{notification}</p>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex" style={{ marginBottom:'var(--space-2)', background:'var(--color-bg-surface)', borderRadius:'var(--radius-md)', padding:4, gap:4 }}>
        {[['menu','Menu', ShoppingCart],['orders','My Orders', Package]].map(([t, label, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="btn flex-1"
            style={{
              padding:'8px var(--space-1)',
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderRadius:'var(--radius-sm)',
              fontSize:'0.8rem',
              fontWeight:700,
              boxShadow: tab === t ? 'var(--shadow-card)' : 'none',
              transition:'all 0.2s',
            }}
            aria-pressed={tab === t}
          >
            <Icon size={13} /> {label}
            {t === 'orders' && orders.length > 0 && (
              <span style={{
                marginLeft:4, background:'var(--color-primary)', color:'white',
                borderRadius:'var(--radius-full)', fontSize:'0.6rem', fontWeight:700, padding:'1px 6px',
              }}>{orders.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* MENU TAB */}
      {tab === 'menu' && (
        <div className="animate-fade-in">
          {categories.map(cat => {
            const catStyle = CATEGORY_COLORS[cat] || { bg:'rgba(0,0,0,0.04)', color:'var(--color-text-secondary)' };
            return (
              <div key={cat} style={{ marginBottom:'var(--space-3)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'var(--space-1)' }}>
                  <span style={{
                    padding:'3px 10px', borderRadius:'var(--radius-full)',
                    background: catStyle.bg, color: catStyle.color,
                    fontSize:'0.65rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase',
                  }}>{cat}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-1)' }}>
                  {MENU.filter(m => m.category === cat).map(item => {
                    const qty = cart[item.id] || 0;
                    return (
                      <article key={item.id} className="card flex items-center justify-between" style={{ padding:'12px var(--space-2)' }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize:'2.2rem', lineHeight:1, flexShrink:0 }}>{item.emoji}</span>
                          <div>
                            <p style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--color-text-primary)' }}>{item.name}</p>
                            <div className="flex items-center gap-2" style={{ marginTop:3 }}>
                              <span style={{ fontSize:'0.85rem', color:'var(--color-primary)', fontWeight:800 }}>₹{item.price}</span>
                              <span className="flex items-center gap-1" style={{ fontSize:'0.68rem', color:'var(--color-text-muted)' }}>
                                <Clock size={9} /> ~{item.prepTime + QUEUE_OFFSET}m
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {qty > 0 && (
                            <>
                              <button
                                className="btn btn--ghost"
                                style={{ padding:'5px 9px', minWidth:30, borderRadius:'var(--radius-sm)' }}
                                onClick={() => removeFromCart(item.id)}
                                aria-label={`Remove one ${item.name}`}
                              ><Minus size={12} /></button>
                              <span style={{ fontWeight:800, fontSize:'0.95rem', minWidth:18, textAlign:'center', color:'var(--color-primary)' }}>{qty}</span>
                            </>
                          )}
                          <button
                            className="btn btn--primary"
                            style={{ padding:'7px 14px', fontSize:'0.8rem', borderRadius:'var(--radius-sm)' }}
                            onClick={() => addToCart(item)}
                            aria-label={`Add ${item.name}`}
                          ><Plus size={13} /></button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Cart sticky bar */}
          {cartCount > 0 && (
            <div className="card animate-slide-up" style={{
              position:'sticky', bottom:'calc(var(--nav-height) + var(--space-2))',
              borderColor:'rgba(109,40,217,0.3)',
              background:'linear-gradient(135deg, rgba(109,40,217,0.97), rgba(79,70,229,0.97))',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'var(--space-1) var(--space-2)', marginTop:'var(--space-2)',
              boxShadow:'var(--shadow-primary)',
            }}>
              <div>
                <p style={{ fontWeight:800, fontSize:'0.88rem', color:'white' }}>
                  {cartCount} item{cartCount>1?'s':''} · ₹{cartTotal}
                </p>
                <p style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.7)' }}>
                  <Clock size={10} style={{ display:'inline', marginRight:3 }} />
                  Ready in ~{maxPrepTime + QUEUE_OFFSET} min
                </p>
              </div>
              <button
                className="btn"
                style={{ padding:'10px var(--space-2)', background:'white', color:'var(--color-primary)', fontWeight:800, borderRadius:'var(--radius-md)', fontSize:'0.82rem' }}
                onClick={placeOrder}
                id="place-order-btn"
              >
                <ChefHat size={14} /> Order Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
          {orders.length === 0 && (
            <div className="card" style={{ textAlign:'center', padding:'var(--space-6)' }}>
              <ShoppingCart size={36} color="var(--color-text-muted)" style={{ margin:'0 auto var(--space-2)' }} />
              <p style={{ color:'var(--color-text-muted)', fontSize:'0.88rem', fontWeight:600 }}>No active orders yet</p>
              <p style={{ color:'var(--color-text-muted)', fontSize:'0.75rem', marginTop:4 }}>Browse the menu to place your first order!</p>
            </div>
          )}
          {orders.map(order => {
            const pct     = order.totalTime > 0 ? Math.round(((order.totalTime - order.timeToReady) / order.totalTime) * 100) : 100;
            const isReady = order.status === 'ready';
            const isNear  = order.status === 'preparing' && order.timeToReady <= 2;
            return (
              <article key={order.id} className="card" style={{
                borderLeft: `4px solid ${isReady ? 'var(--color-green)' : isNear ? 'var(--color-amber)' : 'var(--color-primary)'}`,
              }}>
                {isNear && (
                  <div className="badge badge--amber animate-pulse" style={{ marginBottom:'var(--space-1)' }}>
                    <Bell size={10} /> Leave your seat now! Ready in {order.timeToReady} min
                  </div>
                )}
                {isReady && (
                  <div className="badge badge--green" style={{ marginBottom:'var(--space-1)' }}>
                    <CheckCircle2 size={10} /> Ready for pickup at Concession Stand 1!
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize:'2rem', lineHeight:1 }}>{order.emoji}</span>
                    <div>
                      <p style={{ fontWeight:700, fontSize:'0.88rem' }}>{order.item}</p>
                      <p style={{ fontSize:'0.72rem', color:'var(--color-text-secondary)' }}>₹{order.price}</p>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:800,
                      color: isReady ? 'var(--color-green)' : isNear ? 'var(--color-amber)' : 'var(--color-primary)' }}>
                      {isReady ? '✓' : `${order.timeToReady}m`}
                    </p>
                    <p style={{ fontSize:'0.62rem', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.08em',
                      color: isReady ? 'var(--color-green)' : isNear ? 'var(--color-amber)' : 'var(--color-text-secondary)' }}>
                      {isReady ? 'Pick Up!' : 'Preparing'}
                    </p>
                  </div>
                </div>
                {!isReady && (
                  <div style={{ marginTop:'var(--space-1)' }}>
                    <div className="progress-bar">
                      <div className={`progress-bar__fill progress-bar__fill--${isNear ? 'amber' : 'violet'}`} style={{ width:`${pct}%` }} />
                    </div>
                    <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', marginTop:4 }}>
                      {pct}% complete · {order.timeToReady > 0 ? `~${order.timeToReady} min remaining` : 'Almost ready...'}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
