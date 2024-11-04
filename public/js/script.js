document.addEventListener('DOMContentLoaded', () => {
    const confirmRechargeButton = document.getElementById('confirmRecharge');
  
    if (confirmRechargeButton) {
        confirmRechargeButton.addEventListener('click', async () => {
            console.log('Botón de recarga clicado'); // Mensaje para verificar el clic
            
            const amountInput = document.getElementById('rechargeAmount');
            const amount = amountInput ? amountInput.value : null;

            if (amount && !isNaN(amount) && amount > 0) {
                try {
                    const response = await fetch('/recargar-saldo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ amount: parseFloat(amount) })
                    });

                    const data = await response.json();

                    if (data.success) {
                        alert(`Recarga exitosa. Nuevo saldo: $${data.newBalance}`);
                        location.reload(); // Refresca la página para mostrar el nuevo saldo
                    } else {
                        alert("Error al recargar saldo. Intente nuevamente.");
                    }
                } catch (error) {
                    console.error("Error en la recarga:", error);
                    alert("Error en la recarga. Intente nuevamente.");
                } finally {
                    const rechargeModal = document.getElementById('rechargeModal');
                    const modalInstance = bootstrap.Modal.getInstance(rechargeModal);
                    if (modalInstance) {
                        modalInstance.hide(); // Cierra el modal después de confirmar
                    }
                }
            } else {
                alert("Por favor, ingrese un monto válido.");
            }
        });
    } else {
        console.error('Botón de recarga no encontrado en el DOM');
    }
});
