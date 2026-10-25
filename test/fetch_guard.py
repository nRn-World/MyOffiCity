"""Kör: python test/fetch_guard.py  – testar skyddsreglerna i server.fetch_page (inga riktiga sajter behövs utom lokala/DNS)."""
import os, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
os.environ["PORT"] = "0"
import server  # noqa: E402


def blocked(url):
    try:
        server.fetch_page({"url": url})
    except server.FetchError as err:
        return err.code
    return None


class Guard(unittest.TestCase):
    def test_schemes(self):
        for u in ("file:///etc/passwd", "ftp://example.com/x", "javascript:alert(1)", "", "http://"):
            self.assertEqual(blocked(u), "url", u)

    def test_private_addresses(self):
        for u in ("http://127.0.0.1:8765/api/status", "http://localhost/", "http://10.0.0.5/", "http://192.168.1.1/",
                  "http://169.254.169.254/latest/meta-data/", "http://[::1]/"):
            self.assertIn(blocked(u), ("private", "dns"), u)

    def test_blocket_needs_permission(self):
        self.assertEqual(blocked("https://www.blocket.se/annonser/hela_sverige"), "blocked")
        self.assertEqual(blocked("https://blocket.se/"), "blocked")
        self.assertEqual(blocked("https://sub.blocket.se/x"), "blocked")

    def test_allow_list_lifts_only_the_notice_block(self):
        server.ALLOW_HOSTS.add("blocket.se")
        try:
            self.assertNotEqual(blocked("https://www.blocket.se/"), "blocked")  # blir något annat (nät/robots), inte vårt förbud
        finally:
            server.ALLOW_HOSTS.discard("blocket.se")

    def test_html_extraction(self):
        title, text, links = server.extract_html(
            '<html><title> Hej </title><script>evil()</script><body><p>Röd <b>Volvo</b> 1990</p>'
            '<a href="/annons/1">Volvo 240</a><a href="javascript:x()">no</a><a href="/annons/1">dup</a></body></html>', "https://ex.com/s")
        self.assertEqual(title, "Hej")
        self.assertIn("Röd Volvo 1990", text)
        self.assertNotIn("evil", text)
        self.assertEqual(links, [{"href": "https://ex.com/annons/1", "text": "Volvo 240"}])


if __name__ == "__main__":
    unittest.main(verbosity=2)
