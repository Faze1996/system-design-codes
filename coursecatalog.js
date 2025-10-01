// coursecatalog.js
// Fetches courses from server and renders into the table. Provides client-side search/filter.

async function loadCourses(filter = "") {
    try {
        const response = await fetch('get_courses.php', { credentials: 'include' });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const table = document.getElementById('courseTableBody');
        table.innerHTML = '';

        const filtered = (data || []).filter(c => {
            const name = (c.CourseName || '').toLowerCase();
            const id = (c.CourseID || '').toLowerCase();
            const q = (filter || '').toLowerCase();
            return name.includes(q) || id.includes(q);
        });

        if (filtered.length === 0) {
            table.innerHTML = `<tr><td colspan="7" class="no-data">No courses found.</td></tr>`;
        } else {
            const rows = filtered.map(course => `
                <tr>
                    <td>${escapeHtml(course.CourseID)}</nobr></td>
                    <td>${escapeHtml(course.CourseName)}</td>
                    <td>${escapeHtml(course.DeptName)}</td>
                    <td>${escapeHtml(course.NumberOfCredits)}</td>
                    <td>${escapeHtml(course.CourseLevel)}</td>
                    <td>${escapeHtml(course.CourseDescription || '')}</td>
                    <td>${escapeHtml(course.Prerequisites || 'None')}</td>
                </tr>
            `).join('');
            table.innerHTML = rows;
        }
    } catch (err) {
        console.error('Error loading courses:', err);
        const table = document.getElementById('courseTableBody');
        if (table) table.innerHTML = `<tr><td colspan="7" class="no-data">Failed to load courses. Try again later.</td></tr>`;
    }
}

function escapeHtml(s){
    if (s == null) return '';
    return String(s).replace(/[&<>\"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]); });
}

function applyFilter(){
    const search = document.getElementById('searchInput').value;
    loadCourses(search);
}

document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('searchBtn');
    if (btn) btn.addEventListener('click', applyFilter);
    loadCourses();
});
