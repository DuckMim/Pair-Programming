const API_CPP = 'https://cppcompiler.onrender.com';


async function FetchTask(grade, category, taskName) {
    const res = await fetch(
        `${API_CPP}/tasks/${grade}/${category}/${taskName}`
    );
    if (!res.ok) throw new Error("Task not found");
    return await res.json();
}

async function SubmitSolution(grade, category, taskName, codeText) {
    const res = await fetch(`${API_CPP}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grade: grade,
            category: category,
            task: taskName,
            code: codeText
        })
    });
    if (!res.ok) throw new Error("Submission failed");
    return await res.json();
}

/*
const userCode = `
#include <iostream>
int main() {
    std::cout << "Hello, C++!";
    return 0;
}`;
run();

async function run() {
    let res = await SubmitSolution(8, "linar_1", 'A', userCode)
    console.log(res.results);
}
*/

/*
! ----------------- Використання -----------------  !
 
let res = await FetchTask(8, "linar_1", 'A');
let res = await SubmitSolution(8, "linar_1", 'A', userCode);
 
*-------------------------------------------------------*
*-------------------------------------------------------*
*-------------------------------------------------------*
 
 
FetchTask(8, "linar_1", 'A')
.then(task => {
    console.log("Title:", task.title);
    console.log("Statement:", task.statement);
    })
.catch(err => console.error(err));

 
const userCode = `#include <iostream>
int main() {
int a, b;
std::cin >> a >> b;
std::cout << (a + b);
return 0;
}`;
 
SubmitSolution(8, "linar_1", 'A', userCode)
.then(result => {
    if (!result.compiled) {
        console.error("Compile errors:", result.errors);
    } else {
        result.results.forEach(r => {
            console.log(
                `Test ${r.test}: ${r.passed ? "OK" : "FAIL"}`
            );
            });
    }
})
.catch(err => console.error(err));
*/
