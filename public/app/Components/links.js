export const listGames = () =>{
    const root = document.getElementById('root');
    const list = document.createElement('ul');
    fetch('/api/')
        .then(res => res.json())
        .then(({appList}) => appList.forEach(({title, path}) => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = title;
            link.href = path;
            li.appendChild(link);
            list.appendChild(li);
        }))
        .then(() => root.appendChild(list))
        .catch(err => console.error(err))
}