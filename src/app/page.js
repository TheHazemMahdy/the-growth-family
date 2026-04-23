"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

export default function Home() {
  const { data: session } = useSession();
  const [links, setLinks] = useState([]);
  const [ads, setAds] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modal state for links
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIconType, setNewIconType] = useState('emoji');
  const [newEmoji, setNewEmoji] = useState('🔗');
  const [newImageFile, setNewImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Modal state for Ads
  const [showAdModal, setShowAdModal] = useState(false);
  const [newAdName, setNewAdName] = useState('');
  const [newAdCode, setNewAdCode] = useState('');
  const [newAdPosition, setNewAdPosition] = useState('banner');

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    fetchLinks();
    fetchAds();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads');
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLink = async (e, id) => {
    e.preventDefault();
    if(confirm("Are you sure you want to delete this link?")) {
      try {
        await fetch(`/api/links?id=${id}`, { method: 'DELETE' });
        fetchLinks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteAd = async (e, id) => {
    e.preventDefault();
    if(confirm("Are you sure you want to delete this Ad?")) {
      try {
        await fetch(`/api/ads?id=${id}`, { method: 'DELETE' });
        fetchAds();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    setIsUploading(true);
    let finalIcon = newEmoji;

    if (newIconType === 'image' && newImageFile) {
      const formData = new FormData();
      formData.append('image', newImageFile);
      formData.append('type', 'link');

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.imageUrl) {
          finalIcon = uploadData.imageUrl;
        }
      } catch (err) {
        console.error('Upload failed', err);
        setIsUploading(false);
        return;
      }
    }

    try {
      await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, url: newUrl, icon: finalIcon, desc: '' })
      });
      fetchLinks();
      setShowModal(false);
      setNewTitle('');
      setNewUrl('');
      setNewEmoji('🔗');
      setNewImageFile(null);
    } catch (err) {
      console.error(err);
    }
    setIsUploading(false);
  };

  const handleAddAdSubmit = async (e) => {
    e.preventDefault();
    if (!newAdName || !newAdCode) return;

    try {
      await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAdName, code: newAdCode, position: newAdPosition })
      });
      fetchAds();
      setShowAdModal(false);
      setNewAdName('');
      setNewAdCode('');
    } catch (err) {
      console.error(err);
    }
  };

  const topAds = ads.filter(a => a.position === 'banner');
  const bottomAds = ads.filter(a => a.position === 'rectangle');

  return (
    <div className={styles.main}>
      
      {/* Dynamic Top Ads */}
      {topAds.map(ad => (
        <div key={ad.id} className={styles.adContainer} style={{ position: 'relative' }}>
          {isAdminMode && (
             <button className={`${styles.iconBtn} ${styles.deleteBtn}`} style={{ position: 'absolute', top: 5, right: 5, zIndex: 10, background: 'white' }} onClick={(e) => handleDeleteAd(e, ad.id)}>🗑️</button>
          )}
          <div dangerouslySetInnerHTML={{ __html: ad.code }} />
        </div>
      ))}
      
      {isAdminMode && (
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <button className="btn" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => { setNewAdPosition('banner'); setShowAdModal(true); }}>+ Add Top Banner Ad</button>
        </div>
      )}

      <div className={styles.headerRow}>
        <h1 className={styles.title}>Welcome Home</h1>
        {isAdmin && (
          <button 
            className={`${styles.adminToggleBtn} ${isAdminMode ? styles.active : ''}`}
            onClick={() => setIsAdminMode(!isAdminMode)}
          >
            {isAdminMode ? 'Exit Admin' : 'Admin Edit'}
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {loading && <div style={{ textAlign: 'center', width: '100%', padding: '20px' }}>Loading...</div>}
        
        {!loading && links.length === 0 && isAdminMode && (
          <div style={{ textAlign: 'center', width: '100%', padding: '20px' }}>No links yet. Add one!</div>
        )}

        {links.map((link) => {
          const isImageUrl = link.icon.startsWith('/') || link.icon.startsWith('http');
          
          const CardContent = (
            <>
              <div className={styles.iconWrapper}>
                {isImageUrl ? (
                  <img src={link.icon} alt={link.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  link.icon
                )}
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{link.title}</h2>
                {link.desc && <p className={styles.cardDesc}>{link.desc}</p>}
              </div>
              
              {isAdminMode && (
                <div className={styles.adminActions}>
                  <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={(e) => handleDeleteLink(e, link.id)}>🗑️</button>
                </div>
              )}
            </>
          );

          if (link.isInternal) {
            return (
              <Link href={link.url} key={link.id} className={`card ${styles.linkCard}`}>
                {CardContent}
              </Link>
            );
          } else {
            return (
              <a href={link.url} key={link.id} target="_blank" rel="noopener noreferrer" className={`card ${styles.linkCard}`}>
                {CardContent}
              </a>
            );
          }
        })}
      </div>

      {isAdminMode && (
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          + Add New Link
        </button>
      )}
      
      {/* Dynamic Bottom Ads */}
      {bottomAds.map(ad => (
        <div key={ad.id} className={styles.adContainer} style={{ position: 'relative', marginTop: '30px' }}>
          {isAdminMode && (
             <button className={`${styles.iconBtn} ${styles.deleteBtn}`} style={{ position: 'absolute', top: 5, right: 5, zIndex: 10, background: 'white' }} onClick={(e) => handleDeleteAd(e, ad.id)}>🗑️</button>
          )}
          <div dangerouslySetInnerHTML={{ __html: ad.code }} />
        </div>
      ))}

      {isAdminMode && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button className="btn" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => { setNewAdPosition('rectangle'); setShowAdModal(true); }}>+ Add Bottom Ad</button>
        </div>
      )}

      {/* Add Link Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Add New Link</h2>
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
                <input type="text" required value={newTitle} onChange={e => setNewTitle(e.target.value)} className={styles.modalInput} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>URL</label>
                <input type="text" required value={newUrl} onChange={e => setNewUrl(e.target.value)} className={styles.modalInput} />
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Icon Type</label>
                <select value={newIconType} onChange={e => setNewIconType(e.target.value)} className={styles.modalInput}>
                  <option value="emoji">Emoji</option>
                  <option value="image">Upload Image</option>
                </select>
              </div>

              {newIconType === 'emoji' ? (
                <div key="emoji-container" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Emoji</label>
                  <input type="text" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} className={styles.modalInput} />
                </div>
              ) : (
                <div key="file-container" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Image File</label>
                  <input type="file" accept="image/*" required onChange={e => setNewImageFile(e.target.files[0])} className={styles.modalInput} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={isUploading} className="btn btn-primary" style={{ flex: 1 }}>
                  {isUploading ? 'Saving...' : 'Add Link'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-danger" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Ad Modal */}
      {showAdModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Add New Ad</h2>
            <form onSubmit={handleAddAdSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Ad Name / Description</label>
                <input type="text" required value={newAdName} onChange={e => setNewAdName(e.target.value)} className={styles.modalInput} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>AdSense HTML Code</label>
                <textarea required value={newAdCode} onChange={e => setNewAdCode(e.target.value)} className={styles.modalInput} rows="5"></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add Ad
                </button>
                <button type="button" onClick={() => setShowAdModal(false)} className="btn btn-danger" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
