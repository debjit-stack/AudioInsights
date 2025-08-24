// extension/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const reportsContainer = document.getElementById('reports-container');

    function fetchAndDisplayReports() {
        fetch('http://localhost:4000/api/reports')
            .then(response => response.json())
            .then(reports => {
                reportsContainer.innerHTML = '';
                if (reports.length === 0) {
                    reportsContainer.innerHTML = '<p>No reports found.</p>';
                    return;
                }

                reports.forEach(report => {
                    const card = document.createElement('div');
                    card.className = 'report-card';
                    card.id = `report-${report._id}`; // Give each card a unique ID
                    const createdDate = new Date(report.createdAt).toLocaleString();

                    card.innerHTML = `
                        <button class="delete-btn" data-id="${report._id}" title="Delete Report">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </button>
                        <div class="card-header">
                            <img src="${report.videoThumbnailUrl || ''}" alt="Icon" class="thumbnail">
                            <h3 class="video-title">${report.videoTitle}</h3>
                        </div>
                        <p class="report-date">Analyzed on: ${createdDate}</p>
                        <h4>Big Picture Explanation</h4>
                        <p>${report.bigPictureExplanation || 'N/A'}</p>
                        <h4>Contextual Analysis</h4>
                        <p>${report.contextualAnalysis || 'N/A'}</p>
                        <!-- ... other fields ... -->
                    `;
                    reportsContainer.appendChild(card);
                });

                // Add event listeners to all new delete buttons
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', handleDelete);
                });
            })
            .catch(error => {
                console.error('Error fetching reports:', error);
                reportsContainer.innerHTML = '<p class="error">Could not load reports.</p>';
            });
    }

    function handleDelete(event) {
        const reportId = event.currentTarget.dataset.id;
        
        // Ask for confirmation before deleting
        if (confirm('Are you sure you want to delete this report?')) {
            fetch(`http://localhost:4000/api/reports/${reportId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    // If successful, remove the card from the UI immediately
                    document.getElementById(`report-${reportId}`).remove();
                } else {
                    alert('Failed to delete report.');
                }
            })
            .catch(error => console.error('Error deleting report:', error));
        }
    }

    // Initial load
    fetchAndDisplayReports();
});