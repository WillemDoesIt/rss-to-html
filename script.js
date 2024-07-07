// Fetch and display RSS feed
fetch('./rss.xml') // replace with the link to your rss feed
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.text();
})
.then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
.then(data => {
    const items = data.querySelectorAll('item');
    let feedContent = '';
    items.forEach(item => {
        const title = item.querySelector('title').textContent;
        const pubDate = item.querySelector('pubDate').textContent;
        const description = item.querySelector('description').textContent;
        
        // Prepare comments
        let commentsHtml = '<div class="comments-container">';
        const comments = item.querySelectorAll('comment');
        if (comments.length > 0) {
            commentsHtml += `<p class="show-more" onclick="toggleComments(this)">(${comments.length}) Comments: <img src="/Icons/down.png" style="outline: none; border: none;"></p>`;
            commentsHtml += '<div class="hidden-comments comments-box">';
            
            let lastAuthor = '';
            let lastTime = 0;
            let lastDate = '';

            comments.forEach((comment, index) => {
                const author = comment.querySelector('author').textContent;
                const content = comment.querySelector('content').textContent;
                const date = new Date(comment.querySelector('pubDate').textContent);
                
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const timeDiff = (date - lastTime) / (1000 * 60); // difference in minutes

                if (dateStr !== lastDate) {
                    commentsHtml += `<div class="comment-date">----- ${dateStr} -----</div>`;
                    lastDate = dateStr;
                }

                if (author !== lastAuthor || timeDiff > 5) {
                    commentsHtml += `
                        <table class="comment-table" style="margin-top:10px">
                            <tr>
                                <td>${timeStr}</td>
                                <td style="color: #FC0">${author}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td>${content}</td>
                            </tr>
                        </table>`;
                    lastAuthor = author;
                } else if (author == lastAuthor && timeDiff < 1) {
                    commentsHtml += `
                        <table class="comment-table">
                            <tr>
                                <td></td>
                                <td>${content}</td>
                            </tr>
                        </table>`;
                } else {
                    commentsHtml += `
                        <table class="comment-table">
                            <tr>
                                <td>${timeStr}</td>
                                <td>${content}</td>
                            </tr>
                        </table>`;
                }

                lastTime = date;
            });

            commentsHtml += '</div>';
        }
        commentsHtml += '</div>';

        // Add post and comments to feed content
        feedContent += `
            <div class="page" style="margin-bottom: 30px;">
                <p style="float:right; color:gray;">${pubDate}</p>
                <h1>${title}</h1>
                ${description}
                ${commentsHtml}
            </div>
        `;
    });
    document.getElementById('feedContent').innerHTML = feedContent;
})
.catch(err => console.error('Error fetching/parsing RSS feed:', err));

function toggleComments(element) {
const hiddenComments = element.nextElementSibling;
const arrow = element.querySelector('img');
if (hiddenComments.classList.contains('hidden-comments')) {
    hiddenComments.classList.remove('hidden-comments');
    arrow.src = './Icons/up.png';
} else {
    hiddenComments.classList.add('hidden-comments');
    arrow.src = './Icons/down.png';
}
}