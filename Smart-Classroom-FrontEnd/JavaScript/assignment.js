let assignment_quill;
let currentDate = new Date();
let selectedDate = null;

// Initialize modal features
document.addEventListener("DOMContentLoaded", () => {

    lucide.createIcons(); // Initialize icons

    loadDataPaginated(1, default_page_size);

    // Set user information
    document.getElementById("assignmentUserName").textContent = userName;
    document.getElementById("assignment_userInitials").textContent =
        getUserInitials(userName);
    console.log("Initials: " + userName);

    // Update class info if classroomId is available
    if (classroomId) {
        document.getElementById(
            "assignmentClassInfo"
        ).textContent = `Assigning to: Classroom ${classroomId}`;
    }

    lucide.createIcons();
    initializeQuill();
    initializeDatePicker();
    initializeTimePicker();
    setupFileHandlers();
});

function initializeQuill() {
    assignment_quill = new Quill('#assignment-editor', {
        theme: 'snow',
        placeholder: 'Write your assignment content here...',
        modules: { toolbar: [['bold','italic','underline'], ['link','blockquote'], [{list:'ordered'}, {list:'bullet'}], ['clean']] }
    });
}

function openAssignmentModal() {
    document.getElementById("assignmentModal").classList.remove("hidden");
    document.getElementById("assignmentModal").classList.add("flex");
}

function closeAssignmentModal() {
    document.getElementById("assignmentModal").classList.add("hidden");
    document.getElementById("assignmentModal").classList.remove("flex");
}

// ---------------- Date Picker ----------------
function initializeDatePicker() {
    populateCalendar(currentDate);

    const dateInput = document.getElementById('dateInput');
    dateInput.addEventListener('click', () => document.getElementById('datePicker').classList.toggle('hidden'));

    document.addEventListener('click', e => {
        if (!document.getElementById('datePicker').contains(e.target) && e.target !== dateInput) {
            document.getElementById('datePicker').classList.add('hidden');
        }
    });

    document.getElementById('prevMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()-1); populateCalendar(currentDate); });
    document.getElementById('nextMonth').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth()+1); populateCalendar(currentDate); });
    document.getElementById('todayBtn').addEventListener('click', () => {
        const today = new Date();
        currentDate = new Date(today); selectedDate = new Date(today);
        populateCalendar(currentDate);
        updateDateInput(); document.getElementById('datePicker').classList.add('hidden'); updatePreview();
    });
}

function populateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    document.getElementById("currentMonth").textContent =
        date.toLocaleString("en-US", { month: "long", year: "numeric" });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    // Previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        calendarDays.appendChild(
            createDayElement(daysInPrevMonth - i, 'other-month', new Date(year, month - 1, daysInPrevMonth - i))
        );
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dayElement = createDayElement(day, '', dayDate);
        if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        calendarDays.appendChild(dayElement);
    }

    // Next month
    const totalCells = calendarDays.children.length;
    for (let day = 1; day <= 42 - totalCells; day++) {
        calendarDays.appendChild(
            createDayElement(day, 'other-month', new Date(year, month + 1, day))
        );
    }
}

function createDayElement(day, className, date) {
    const el = document.createElement('div');
    el.className = `date-picker-cell text-sm rounded-lg ${className} p-1 text-center cursor-pointer`;
    el.textContent = day;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight for comparison

    if (date < today && !className.includes('other-month')) {
        // Past dates → disabled
        el.classList.add('opacity-30', 'cursor-not-allowed');
    } else if (!className.includes('other-month')) {
        // Today or future dates → selectable
        el.classList.add('text-blue-600', 'hover:bg-blue-100', 'dark:text-blue-400', 'dark:hover:bg-blue-900/30');

        el.addEventListener('click', () => {
            selectedDate = new Date(date);
            populateCalendar(currentDate);
            updateDateInput();
            document.getElementById('datePicker').classList.add('hidden');
            updatePreview();
        });
    }

    return el;
}

function updateDateInput(){ if(selectedDate){ document.getElementById('dateInput').value = selectedDate.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}); } }

// ---------------- Time Picker ----------------
function initializeTimePicker(){
    const defaultTime = new Date(); defaultTime.setHours(defaultTime.getHours()+1,0,0,0);
    document.getElementById('timeSelect').value = `${defaultTime.getHours().toString().padStart(2,'0')}:${defaultTime.getMinutes().toString().padStart(2,'0')}`;
    document.getElementById('timeSelect').addEventListener('change',updatePreview);
}

// ---------------- Preview ----------------
function updatePreview(){
    if(!selectedDate) return;
    const timeValue = document.getElementById('timeSelect').value;
    if(!timeValue) return;
    const [hours, minutes] = timeValue.split(':'); const hour24=parseInt(hours); const hour12 = hour24===0?12:(hour24>12?hour24-12:hour24); const ampm=hour24<12?'AM':'PM';
    document.getElementById('previewDateTime').textContent = `${selectedDate.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} at ${hour12}:${minutes} ${ampm}`;
}

// ---------------- File Handling ----------------
function setupFileHandlers(){
    const fileInput = document.getElementById('assignmentFileInput');
    const fileSelectBtn = document.getElementById('assignmentFileSelectBtn');
    const fileCount = document.getElementById('assignmentFileCount');
    const filePreviews = document.getElementById('assignmentFilePreviews');

    fileSelectBtn.addEventListener('click', ()=>fileInput.click());
    fileInput.addEventListener('change', ()=>{
        const files = Array.from(fileInput.files);
        if(files.length>0){
            fileCount.textContent = `${files.length} file${files.length>1?'s':''} selected`; fileCount.classList.remove('hidden'); filePreviews.classList.remove('hidden');
            filePreviews.innerHTML='';
            files.forEach((file,index)=>{
                const preview = document.createElement('div'); preview.className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded';
                preview.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="file" class="w-4 h-4 text-gray-500"></i><span class="text-sm text-gray-700 dark:text-gray-300">${file.name}</span><span class="text-xs text-gray-500">(${(file.size/1024).toFixed(1)} KB)</span></div><button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700"><i data-lucide="x" class="w-4 h-4"></i></button>`;
                filePreviews.appendChild(preview);
            });
            lucide.createIcons();
        }else{ fileCount.classList.add('hidden'); filePreviews.classList.add('hidden'); }
    });
}

function removeFile(index){
    const fileInput=document.getElementById('assignmentFileInput'); const dt=new DataTransfer();
    Array.from(fileInput.files).forEach((file,i)=>{ if(i!==index) dt.items.add(file); });
    fileInput.files=dt.files; setupFileHandlers();
}
