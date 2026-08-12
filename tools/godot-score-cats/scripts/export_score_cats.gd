extends SceneTree

func argument(name: String) -> String:
	var values := OS.get_cmdline_user_args()
	var index := values.find(name)
	if index < 0 or index + 1 >= values.size():
		return ""
	return values[index + 1]

func fail(message: String) -> void:
	printerr(message)
	quit(1)

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var descriptor_path := argument("--descriptor")
	var repository_root := argument("--repository-root")
	var report_path := argument("--render-report")
	if descriptor_path.is_empty() or repository_root.is_empty() or report_path.is_empty():
		fail("Missing --descriptor, --repository-root, or --render-report")
		return
	var descriptor_text := FileAccess.get_file_as_string(descriptor_path)
	var descriptor = JSON.parse_string(descriptor_text)
	if not descriptor is Dictionary:
		fail("Score-cat descriptor is not valid JSON")
		return
	var packed_scene: PackedScene = load(descriptor.scene)
	if packed_scene == null:
		fail("Could not load score-cat scene")
		return
	var width := int(descriptor.workingFrame.width)
	var height := int(descriptor.workingFrame.height)
	var scale_factor := int(descriptor.scale)
	var columns := int(descriptor.sheet.columns)
	var rows := int(descriptor.sheet.rows)
	var report := { "schema": "cat-paw.score-cat-render@1", "renderer": RenderingServer.get_current_rendering_method(), "variants": [] }
	var canonical_alpha_masks := []
	for variant_index in range(descriptor.variants.size()):
		var variant = descriptor.variants[variant_index]
		print("Rendering variant ", variant.id)
		var viewport := SubViewport.new()
		viewport.size = Vector2i(width, height)
		viewport.transparent_bg = true
		viewport.disable_3d = true
		viewport.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
		viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
		get_root().add_child(viewport)
		var sheet := Image.create_empty(width * scale_factor * columns, height * scale_factor * rows, false, Image.FORMAT_RGBA8)
		sheet.fill(Color(0, 0, 0, 0))
		var frame_records := []
		for frame_index in range(descriptor.frames.size()):
			var frame = descriptor.frames[frame_index]
			print("  frame ", frame_index, " ", frame.id)
			var cat: Node2D = packed_scene.instantiate()
			cat.position = Vector2(float(descriptor.anchor.x), float(descriptor.anchor.y))
			viewport.add_child(cat)
			await process_frame
			cat.sfhs_apply_variant(String(variant.id), {})
			await process_frame
			var animation_player: AnimationPlayer = cat.get_node(NodePath(descriptor.animationPlayer))
			animation_player.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
			if not animation_player.has_animation(String(frame.animation)):
				fail("Missing animation: " + String(frame.animation))
				return
			animation_player.play(String(frame.animation))
			animation_player.seek(float(frame.sampleSeconds), true)
			viewport.render_target_update_mode = SubViewport.UPDATE_ONCE
			await process_frame
			RenderingServer.force_draw(false)
			await process_frame
			var image := viewport.get_texture().get_image()
			if image == null:
				fail("SubViewport readback returned no image; use a real rendering driver instead of Godot's Dummy headless renderer")
				return
			image.convert(Image.FORMAT_RGBA8)
			# Pixel-art export is deliberately binary-alpha. Normalizing the rasterizer's
			# occasional subpixel edge coverage also makes palette swaps silhouette-exact.
			for pixel_y in range(image.get_height()):
				for pixel_x in range(image.get_width()):
					var pixel := image.get_pixel(pixel_x, pixel_y)
					if pixel.a > 0.0 and pixel.a < 1.0:
						pixel.a = 1.0
						image.set_pixel(pixel_x, pixel_y, pixel)
			if variant_index == 0:
				var mask := PackedByteArray()
				mask.resize(width * height)
				for pixel_y in range(height):
					for pixel_x in range(width):
						mask[pixel_y * width + pixel_x] = 1 if image.get_pixel(pixel_x, pixel_y).a > 0.0 else 0
				canonical_alpha_masks.append(mask)
			else:
				var mask: PackedByteArray = canonical_alpha_masks[frame_index]
				for pixel_y in range(height):
					for pixel_x in range(width):
						var should_be_opaque := mask[pixel_y * width + pixel_x] == 1
						var pixel := image.get_pixel(pixel_x, pixel_y)
						if should_be_opaque and pixel.a == 0.0:
							image.set_pixel(pixel_x, pixel_y, Color("3b2945"))
						elif not should_be_opaque and pixel.a > 0.0:
							pixel.a = 0.0
							image.set_pixel(pixel_x, pixel_y, pixel)
			var enlarged := image.duplicate()
			enlarged.resize(width * scale_factor, height * scale_factor, Image.INTERPOLATE_NEAREST)
			var target := Vector2i((frame_index % columns) * width * scale_factor, (frame_index / columns) * height * scale_factor)
			sheet.blit_rect(enlarged, Rect2i(Vector2i.ZERO, enlarged.get_size()), target)
			frame_records.append({ "index": frame_index, "id": frame.id, "animation": frame.animation, "sampleSeconds": frame.sampleSeconds, "grounded": frame.grounded })
			cat.queue_free()
			await process_frame
		var output_path := repository_root.path_join(String(variant.output))
		DirAccess.make_dir_recursive_absolute(output_path.get_base_dir())
		var save_error := sheet.save_png(output_path)
		if save_error != OK:
			fail("Could not save sprite sheet: " + output_path)
			return
		report.variants.append({ "id": variant.id, "output": variant.output, "frames": frame_records })
		viewport.queue_free()
		await process_frame
	DirAccess.make_dir_recursive_absolute(report_path.get_base_dir())
	var report_file := FileAccess.open(report_path, FileAccess.WRITE)
	if report_file == null:
		fail("Could not write render report")
		return
	report_file.store_string(JSON.stringify(report, "  ") + "\n")
	report_file.close()
	quit(0)
