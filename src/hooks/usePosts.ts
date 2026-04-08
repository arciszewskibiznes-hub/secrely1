"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post, Profile } from "@/types/database";

const supabase = createClient();

async function fetchPostsWithCreators(
  query: ReturnType<typeof supabase.from>
): Promise<Post[]> {
  const { data: posts, error } = await (query as any);
  if (error || !posts || posts.length === 0) return [];

  const creatorIds = [...new Set(posts.map((p: { creator_id: string }) => p.creator_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, is_creator, is_verified, created_at")
    .in("id", creatorIds);

  const profileMap = new Map<string, Profile>(
    (profiles ?? []).map((p: Profile) => [p.id, p])
  );

  return posts.map((post: any) => ({
    ...post,
    creator: profileMap.get(post.creator_id) ?? null,
  })) as Post[];
}

const POST_COLUMNS = "id, creator_id, image_url, caption, teaser_text, price, is_locked, like_count, comment_count, view_count, tags, created_at";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    hasFetchedRef.current = true;
    try {
      const result = await fetchPostsWithCreators(
        supabase
          .from("posts")
          .select(POST_COLUMNS)
          .order("created_at", { ascending: false })
      );
      if (mountedRef.current) {
        setPosts(result);
        setError(null);
      }
    } catch (err: unknown) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : "Error");
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetchedRef.current) fetchPosts();
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
      .select(POST_COLUMNS)
      .eq("id", id)
      .single()
      .then(async ({ data: postData }) => {
        if (!postData || !mountedRef.current) {
          if (mountedRef.current) setIsLoading(false);
          return;
        }
        const { data: creator } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, bio, is_creator, is_verified, created_at")
          .eq("id", postData.creator_id)
          .single();
        if (mountedRef.current) {
          setPost({ ...postData, creator: creator ?? null } as Post);
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
  const fetchedForRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!creatorId || fetchedForRef.current === creatorId) {
      if (!creatorId) setIsLoading(false);
      return;
    }
    fetchedForRef.current = creatorId;
    setIsLoading(true);

    fetchPostsWithCreators(
      supabase
        .from("posts")
        .select(POST_COLUMNS)
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false })
    ).then((result) => {
      if (mountedRef.current) {
        setPosts(result);
        setIsLoading(false);
      }
    });
  }, [creatorId]);

  return { posts, isLoading };
}
