import React from 'react';
import PostCard from './PostCard';

const PostsList = ({ posts, onOpenPost }) => {
    return (
        <div className="posts-container" id="postsContainer">
            {posts.map(post => (
                <PostCard key={post.id} post={post} onOpenDetail={onOpenPost} />
            ))}
        </div>
    );
};

export default PostsList;


