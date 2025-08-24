// extension/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const reportsContainer = document.getElementById('reports-container');

    fetch('http://localhost:4000/api/reports')
        .then(response => response.json())
        .then(reports => {
            reportsContainer.innerHTML = '';
            if (reports.length === 0) {
                return reportsContainer.innerHTML = '<p>No reports found.</p>';
            }

            reports.forEach(report => {
                const card = document.createElement('div');
                card.className = 'report-card';
                const createdDate = new Date(report.createdAt).toLocaleString();

                // --- NEW: Display the title and thumbnail ---
                card.innerHTML = `
                    <div class="card-header">
                        <img src="${report.videoThumbnailUrl || ''}" alt="Icon" class="thumbnail">
                        <h3 class="video-title">${report.videoTitle}</h3>
                    </div>
                    <p class="report-date">Analyzed on: ${createdDate}</p>
                    
                    <h4>Big Picture Explanation</h4>
                    <p>${report.bigPictureExplanation || 'N/A'}</p>

                    <h4>Contextual Analysis</h4>
                    <p>${report.contextualAnalysis || 'N/A'}</p>
                    
                    <h4>Main Viewpoints Presented</h4>
                    <ul>
                        ${report.mainViewpoints && report.mainViewpoints.length > 0 ? 
                            report.mainViewpoints.map(item => `<li><strong>${item.speaker || 'A speaker'}:</strong> ${item.viewpoint}</li>`).join('') : 
                            '<li>N/A</li>'
                        }
                    </ul>

                    <h4>Key Questions</h4>
                    <ul>
                        ${report.keyQuestions && report.keyQuestions.length > 0 ? 
                            report.keyQuestions.map(item => `<li>${item}</li>`).join('') : 
                            '<li>N/A</li>'
                        }
                    </ul>
                `;
                // -------------------------------------------
                reportsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching reports:', error);
            reportsContainer.innerHTML = '<p class="error">Could not load reports.</p>';
        });
});