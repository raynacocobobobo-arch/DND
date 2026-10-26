"""Offline checks for the approved-art publisher; no GitHub or Google access needed."""
import io
from pathlib import Path
import sys
import tempfile
import unittest

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from transfer_art import publish_bytes, safe_repo_path, validate_source_url


class PublisherTests(unittest.TestCase):
    def test_lossless_art_and_thumbnail(self):
        canvas = Image.new("RGB", (141, 252))
        px = canvas.load()
        for y in range(252):
            for x in range(141):
                px[x, y] = ((x * 11 + y) % 256, (x + y * 7) % 256, y % 256)
        stream = io.BytesIO()
        canvas.save(stream, format="PNG")
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            entry = {
                "name": "ace-of-wands-test",
                "expected_size": [141, 252],
                "output_path": "minor-arcana/wands/final/ace-of-wands-v42.webp",
                "thumb_path": "minor-arcana/wands/thumbs/ace-of-wands-v42.webp",
            }
            data = publish_bytes(stream.getvalue(), entry, root)
            self.assertEqual(data["size"], [141, 252])
            with Image.open(root / entry["output_path"]) as check:
                self.assertEqual(check.convert("RGB").tobytes(), canvas.tobytes())
                self.assertEqual(check.format, "WEBP")
            self.assertTrue((root / entry["thumb_path"]).is_file())
            with self.assertRaises(FileExistsError):
                publish_bytes(stream.getvalue(), entry, root)

    def test_abort_on_resolution_mismatch(self):
        photo = Image.new("RGB", (30, 60), (9, 32, 64))
        out = io.BytesIO()
        photo.save(out, "PNG")
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            entry = {"expected_size": [941, 1672],
                     "output_path": "minor-arcana/cups/final/four-v99.webp",
                     "thumb_path": "minor-arcana/cups/thumbs/four-v99.webp"}
            with self.assertRaisesRegex(ValueError, "No auto-resize"):
                publish_bytes(out.getvalue(), entry, root)

    def test_reject_unsafe_paths(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for bad in ("../../private.txt", "/tmp/bad.webp", "minor-arcana/../private/file.webp",
                        "minor-arcana\\wands\\evil.webp", "secret/file.webp"):
                with self.subTest(path=bad), self.assertRaises(ValueError):
                    safe_repo_path(root, bad)

    def test_validate_signed_doc_source(self):
        validate_source_url("https://docs.google.com/docs-images-rt/EXAMPLE=s2048?key=test")
        for invalid in ("http://docs.google.com/docs-images-rt/example",
                        "https://example.com/docs-images-rt/example",
                        "https://docs.google.com/drive/u/0/my-drive",
                        "file:///tmp/image.png"):
            with self.subTest(url=invalid), self.assertRaises(ValueError):
                validate_source_url(invalid)


if __name__ == "__main__":
    unittest.main()
