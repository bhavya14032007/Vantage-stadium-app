/**
 * ExpressOrder — Mobile-first food pre-ordering interface.
 * Calculates Time-to-Ready and notifies user 2 min before completion.
 */
import { useState } from 'react';
import { ShoppingCart, Bell, CheckCircle2, Clock, Trash2, Plus, Minus, ChefHat, Zap } from 'lucide-react';

const MENU = [
  { id: 'm1', name: 'Spicy Loaded Fries',   emoji: '🍟', price: 180, prepTime: 8,  category: 'Snacks' },
  { id: 'm2', name: 'Stadium Burger',        emoji: '🍔', price: 250, prepTime: 12, category: 'Mains'  },
  { id: 'm3', name: 'BBQ Chicken Wings',     emoji: '🍗', price: 220, prepTime: 14, category: 'Mains'  },
  { id: 'm4', name: 'Nachos & Cheese',       emoji: '🧀', price: 150, prepTime: 5,  category: 'Snacks' },
  { id: 'm5', name: 'Cold Brew Coffee',      emoji: '☕', price: 120, prepTime: 3,  category: 'Drinks' },
  { id: 'm6', name: 'Mango Smoothie',        emoji: '🥭', price: 140, prepTime: 4,  category: 'Drinks' },
];

const QUEUE_OFFSET = 6; // simulated queue backlog minutes

function statusColor(status) {
  if (status === 'ready')    return 'var(--color-green)';
  if (status === 'preparing') return 'var(--color-amber)';
  return 'var(--color-text-muted)';
}
function statusBg(status) {
  if (status === 'ready')     return 'rgba(0,255,136,0.1)';
  if (status === 'preparing') return 'rgba(255,183,0,0.1)';
  return 'rgba(255,255,255,0.04)';
}

export default function ExpressOrder({ orders, setOrders }) {
  const [cart, setCart]         = useState({});
  const [tab, setTab]           = useState('menu');  // 'menu' | 'orders'
  const [notification, setNotification] = useState(null);

  /* Cart helpers */
  const addToCart = (item) => {
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };
  const removeFromCart = (id) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) next[id] -= 1; else delete next[id];
      return next;
    });
  };
  const cartTotal    = Object.entries(cart).reduce((s, [id, qty]) => s + (MENU.find(m=>m.id===id)?.price||0)*qty, 0);
  const cartCount    = Object.values(cart).reduce((s, v) => s + v, 0);
  const maxPrepTime  = Math.max(0, ...Object.keys(cart).map(id => MENU.find(m=>m.id===id)?.prepTime||0));

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
    setNotification('Order placed! We\'ll alert you 2 min before it\'s ready. 🎉');
    setTimeout(() => setNotification(null), 4000);
  };

  const categories = [...new Set(MENU.map(m => m.category))];

  return (
    <section aria-label="Express Ordering">
      {/* Header */}
      <div className="section-header">
        <span className="section-title">Express Order</span>
        <span className="badge badge--green">
          <Zap size={10} /> Skip the Queue
        </span>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className="card animate-slide-up"
          style={{ marginBottom:'var(--space-2)', background:'rgba(0,255,136,0.08)', borderColor:'var(--color-green)', padding:'var(--space-1) var(--space-2)' }}
          role="alert"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} color="var(--color-green)" />
            <p style={{ fontSize:'0.8rem', color:'var(--color-text-primary)' }}>{notification}</p>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1" style={{ marginBottom:'var(--space-2)', background:'var(--color-bg-surface)', borderRadius:'var(--radius-md)', padding:4 }}>
        {[['menu','Menu', ShoppingCart], ['orders','My Orders', Bell]].map(([t, label, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="btn flex-1"
            style={{
              padding:'8px var(--space-1)',
              background: tab === t ? 'var(--color-bg-card)' : 'transparent',
              color: tab === t ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              borderRadius:'var(--radius-sm)',
              fontSize:'0.8rem',
              transition: 'all 0.2s',
            }}
            aria-pressed={tab === t}
          >
            <Icon size={13} /> {label}
            {t === 'orders' && orders.length > 0 && (
              <span style={{
                marginLeft:4, background:'var(--color-green)', color:'var(--color-text-inverse)',
                borderRadius:'var(--radius-full)', fontSize:'0.6rem', fontWeight:700,
                padding:'1px 5px',
              }}>{orders.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* MENU TAB */}
      {tab === 'menu' && (
        <div className="animate-fade-in">
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom:'var(--space-2)' }}>
              <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'var(--space-1)' }}>
                {cat}
              </p>
              <div className="flex flex-col gap-2">
                {MENU.filter(m => m.category === cat).map(item => {
                  const qty = cart[item.id] || 0;
                  return (
                    <article key={item.id} className="card flex items-center justify-between" style={{ padding:'var(--space-1) var(--space-2)' }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize:'2rem', lineHeight:1 }}>{item.emoji}</span>
                        <div>
                          <p style={{ fontWeight:600, fontSize:'0.85rem' }}>{item.name}</p>
                          <div className="flex items-center gap-2" style={{ marginTop:2 }}>
                            <span style={{ fontSize:'0.75rem', color:'var(--color-green)', fontWeight:700 }}>₹{item.price}</span>
                            <span className="flex items-center gap-1" style={{ fontSize:'0.65rem', color:'var(--color-text-muted)' }}>
                              <Clock size={9} /> ~{item.prepTime + QUEUE_OFFSET}m
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {qty > 0 ? (
                          <>
                            <button
                              className="btn btn--ghost"
                              style={{ padding:'4px 8px', minWidth:28 }}
                              onClick={() => removeFromCart(item.id)}
                              aria-label={`Remove one ${item.name}`}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ fontWeight:700, fontSize:'0.9rem', minWidth:16, textAlign:'center' }}>{qty}</span>
                          </>
                        ) : null}
                        <button
                          className="btn btn--primary"
                          style={{ padding:'6px 12px', fontSize:'0.75rem' }}
                          onClick={() => addToCart(item)}
                          aria-label={`Add ${item.name} to cart`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Cart flotaing footer */}
          {cartCount > 0 && (
            <div
              className="card animate-slide-up"
              style={{
                position:'sticky', bottom:'calc(var(--nav-height) + var(--space-2))',
                borderColor:'var(--color-green)', background:'rgba(0,255,136,0.07)',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'var(--space-1) var(--space-2)', marginTop:'var(--space-2)',
              }}
            >
              <div>
                <p style={{ fontWeight:700, fontSize:'0.85rem' }}>{cartCount} item{cartCount>1?'s':''} · ₹{cartTotal}</p>
                <p style={{ fontSize:'0.68rem', color:'var(--color-text-secondary)' }}>
                  <Clock size={10} style={{ display:'inline', marginRight:3 }} />
                  Ready ~{maxPrepTime + QUEUE_OFFSET} min (incl. queue)
                </p>
              </div>
              <button className="btn btn--primary" onClick={placeOrder} id="place-order-btn">
                <ChefHat size={14} /> Order Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div className="animate-fade-in flex flex-col gap-2">
          {orders.length === 0 && (
            <div className="card" style={{ textAlign:'center', padding:'var(--space-5)' }}>
              <ShoppingCart size={32} color="var(--color-text-muted)" style={{ margin:'0 auto var(--space-2)' }} />
              <p style={{ color:'var(--color-text-muted)', fontSize:'0.85rem' }}>No active orders</p>
            </div>
          )}
          {orders.map(order => {
            const pct = order.totalTime > 0 ? Math.round(((order.totalTime - order.timeToReady) / order.totalTime) * 100) : 100;
            const isNearReady = order.status === 'preparing' && order.timeToReady <= 2;

            return (
              <article
                key={order.id}
                className="card"
                style={{ borderColor: order.status === 'ready' ? 'rgba(0,255,136,0.3)' : isNearReady ? 'rgba(255,183,0,0.3)' : 'var(--color-border)', background: statusBg(order.status) }}
              >
                {/* Near-ready alert */}
                {isNearReady && (
                  <div className="badge badge--amber animate-pulse" style={{ marginBottom:'var(--space-1)', fontSize:'0.65rem' }}>
                    <Bell size={10} /> Leave your seat now! Ready in {order.timeToReady} min
                  </div>
                )}
                {order.status === 'ready' && (
                  <div className="badge badge--green animate-pulse" style={{ marginBottom:'var(--space-1)', fontSize:'0.65rem' }}>
                    <CheckCircle2 size={10} /> Your order is ready for pickup!
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize:'1.8rem' }}>{order.emoji}</span>
                    <div>
                      <p style={{ fontWeight:700, fontSize:'0.85rem' }}>{order.item}</p>
                      <p style={{ fontSize:'0.7rem', color:'var(--color-text-secondary)' }}>₹{order.price}</p>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:900, color: statusColor(order.status) }}>
                      {order.status === 'ready' ? '✓' : `${order.timeToReady}m`}
                    </p>
                    <p style={{ fontSize:'0.62rem', color: statusColor(order.status), textTransform:'uppercase', fontWeight:700, letterSpacing:'0.08em' }}>
                      {order.status === 'ready' ? 'Ready!' : 'Preparing'}
                    </p>
                  </div>
                </div>

                {order.status === 'preparing' && (
                  <div style={{ marginTop:'var(--space-1)' }}>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar__fill progress-bar__fill--${isNearReady ? 'amber' : 'green'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', marginTop:4 }}>
                      {pct}% complete — {order.timeToReady > 0 ? `~${order.timeToReady} min remaining` : 'Almost done...'}
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
