import React from 'react';

const PostCard = ({ post, onOpenDetail }) => {
    return (
        <div className="post-card" onClick={() => onOpenDetail(post)}>
            <img src={post.image} alt={post.title} className="post-image" />
            <div className="post-content">
                <div className="post-author">
                    <img src={post.avatar} alt={post.authorName} className="post-avatar" />
                    <div className="post-author-info">
                        <div className="post-author-name">{post.authorName}</div>
                    </div>
                </div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-amount">{post.amount.toLocaleString('ru-RU')} ₽</p>
            </div>
        </div>
    );
};

export default PostCard;


