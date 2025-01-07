const axios = require('axios');

module.exports = function(app) {
  // API Key yang valid
  const ApikeyReal = "zerodev"; // API key yang harus digunakan
  const apiKeyExternal = "linebaik"; // API key untuk API eksternal

  // Fungsi untuk membuat pembayaran
  async function createPayment(apikey, amount, codeqr) {
    try {
      // Periksa apakah API key yang diberikan valid
      if (apikey !== ApikeyReal) {
        return { error: 'API key tidak valid.' };
      }

      const url = `https://lineaja.my.id/api/orkut/createpayment?apikey=${apiKeyExternal}&amount=${amount}&codeqr=${codeqr}`;

      // Melakukan permintaan ke API eksternal dengan API key yang benar
      const response = await axios.get(url);

      if (response.data.status) {
        // Hanya mengembalikan bagian 'result' dari respons API eksternal
        return response.data.result;
      } else {
        throw new Error('API Error: Response status is false');
      }
    } catch (error) {
      console.error('Error:', error.message);
      return { error: 'Terjadi kesalahan saat memproses permintaan.' };
    }
  }

  // Endpoint '/createpayment'
  app.get('/createpayment', async (req, res) => {
    try {
      const { apikey, amount, codeqr } = req.query;

      // Periksa apakah parameter apikey, amount, dan codeqr ada
      if (!apikey || !amount || !codeqr) {
        return res.status(400).json({ error: 'Parameter "apikey", "amount", dan "codeqr" wajib disediakan.' });
      }

      // Validasi parameter "amount" dan "codeqr"
      if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Parameter "amount" harus berupa angka positif.' });
      }

      if (!codeqr.trim()) {
        return res.status(400).json({ error: 'Parameter "codeqr" tidak boleh kosong.' });
      }

      // Panggil fungsi untuk membuat pembayaran jika API key valid
      const result = await createPayment(apikey, amount, codeqr);

      // Jika ada error dalam result
      if (result.error) {
        return res.status(401).json({ error: result.error });
      }

      // Jika API key valid, kembalikan respons dengan hanya bagian 'result'
      res.status(200).json({
        status: 200,
        creator: "ZeroDev",
        result: result
      });
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan pada server.', message: error.message });
    }
  });
};
