import { useCallback, useEffect, useState } from 'react';
import { getMediaLikeCount, getMediaLiked, setMediaLiked } from '../services/firebaseService';

const localKey = (mediaId: string) => `kubanan-like:${mediaId}`;

const readLocalLike = (mediaId: string) => {
  try {
    return localStorage.getItem(localKey(mediaId)) === '1';
  } catch {
    return false;
  }
};

const writeLocalLike = (mediaId: string, liked: boolean) => {
  try {
    localStorage.setItem(localKey(mediaId), liked ? '1' : '0');
  } catch {
    // Storage can be unavailable (private mode); the like still animates.
  }
};

export const useMediaLike = (mediaId: string, uid?: string | null) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLiked(uid ? false : readLocalLike(mediaId));

    getMediaLikeCount(mediaId).then((total) => {
      if (active) setCount(total);
    });

    if (uid) {
      getMediaLiked(mediaId, uid).then((value) => {
        if (active) setLiked(value);
      });
    }

    return () => {
      active = false;
    };
  }, [mediaId, uid]);

  const toggle = useCallback(async () => {
    if (!mediaId || busy) return;
    const next = !liked;
    setBusy(true);
    setLiked(next);
    setCount((value) => Math.max(0, value + (next ? 1 : -1)));

    try {
      if (uid) await setMediaLiked(mediaId, uid, next);
      else writeLocalLike(mediaId, next);
    } catch {
      setLiked(!next);
      setCount((value) => Math.max(0, value + (next ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  }, [mediaId, uid, liked, busy]);

  return { liked, count, toggle, busy };
};
