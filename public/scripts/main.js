if (document.querySelector('#new-service')) {
    document.querySelector('#new-service').addEventListener('submit', (e) => {
        e.preventDefault();

        let service = {};
        const inputs = document.querySelectorAll('.form-control');
        for (const input of inputs) {
            service[input.name] = input.value;
        }

        axios.post('/services', service)
            .then(function (response) {
                window.location.replace(`/services/${response.data.service._id}`);
            })
            .catch(function (error) {
                const alert = document.getElementById('alert')
                alert.classList.add('alert-warning');
                alert.textContent = 'Your service could not be saved -- please try again.';
                alert.style.display = 'block';
                setTimeout(() => {
                    alert.style.display = 'none';
                    alert.classList.remove('alert-warning');
                   }, 3000)
            });
    });
}