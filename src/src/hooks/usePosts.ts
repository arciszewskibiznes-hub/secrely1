"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/database";

const supabase = createClient();

// Supabase join syntax: use the column name directly, not the FK constraint name.
// "creator:profiles(*)}" means: join profiles table via creator_id column → alias as creator
const POST_SELECT = `
  id,
  creator_id,
  image_url,
  caption,
  teaser_text,
  price,
  is_locked,
  like_count,
  comment_count,
  view_count,
  tags,
  created_at,
  creator:profiles!creator_id(
    id, username, display_name, avatar_url, bio, is_creator, is_verified, created_at
  )
`;

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    const { data, error: err } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .order("created_at", { ascending: false });

    if (!mountedRef.current) return;
    if (err) {
      setError(err.message);
    } else {
      setPosts((data ?? []) as Post[]);
      setError(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, isLoading, error, refetch: fetchPosts };
}

export function usePost(id: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    setIsLoading(true);
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (mountedRef.current) {
          setPost((data as Post) ?? null);
          setIsLoading(false);
        }
      });
  }, [id]);

  return { post, isLoading };
}

export function useCreatorPosts(creatorId: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!creatorId) { setIsLoading(false); return; }
    setIsLoading(true);
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (mountedRef.current) {
          setPosts((data ?? []) as Post[]);
          setIsLoading(false);
        }
      });
  }, [creatorId]);

  return { posts, isLoading };
}
