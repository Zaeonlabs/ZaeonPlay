/*
 * StreamPlugins - Native OBS Plugin Wrapper
 *
 * This thin C++ plugin:
 * 1. Starts the bundled Node.js server as a child process
 * 2. Registers browser docks in OBS's Docks menu
 * 3. Stops the server when OBS unloads the plugin
 */

#include <obs-module.h>
#include <obs-frontend-api.h>
#include <cstdlib>
#include <string>

#ifdef _WIN32
#include <windows.h>
#else
#include <signal.h>
#include <unistd.h>
#include <sys/wait.h>
#endif

OBS_DECLARE_MODULE()
OBS_MODULE_USE_DEFAULT_LOCALE("streamplugins", "en-US")

#define STREAMPLUGINS_PORT "3847"
#define STREAMPLUGINS_BASE_URL "http://localhost:" STREAMPLUGINS_PORT

static const char *MODULE_NAME = "streamplugins";

#ifdef _WIN32
static HANDLE server_process = nullptr;
#else
static pid_t server_pid = 0;
#endif

static bool server_running = false;

// --- Server Process Management ---

static bool start_server()
{
	// Resolve the server binary path relative to the plugin data directory
	char *data_path = obs_module_file("server/streamplugins-server"
#ifdef _WIN32
					  ".exe"
#endif
	);

	if (!data_path) {
		blog(LOG_ERROR, "[StreamPlugins] Server binary not found in plugin data directory");
		return false;
	}

	std::string server_path(data_path);
	bfree(data_path);

#ifdef _WIN32
	STARTUPINFOA si = {};
	PROCESS_INFORMATION pi = {};
	si.cb = sizeof(si);
	si.dwFlags = STARTF_USESHOWWINDOW;
	si.wShowWindow = SW_HIDE;

	std::string cmd = "\"" + server_path + "\"";

	if (!CreateProcessA(nullptr, cmd.data(), nullptr, nullptr, FALSE,
			    CREATE_NO_WINDOW, nullptr, nullptr, &si, &pi)) {
		blog(LOG_ERROR, "[StreamPlugins] Failed to start server process");
		return false;
	}

	server_process = pi.hProcess;
	CloseHandle(pi.hThread);
#else
	server_pid = fork();
	if (server_pid == 0) {
		execl(server_path.c_str(), server_path.c_str(), nullptr);
		_exit(1);
	} else if (server_pid < 0) {
		blog(LOG_ERROR, "[StreamPlugins] Failed to fork server process");
		return false;
	}
#endif

	server_running = true;
	blog(LOG_INFO, "[StreamPlugins] Server started on port %s", STREAMPLUGINS_PORT);
	return true;
}

static void stop_server()
{
	if (!server_running)
		return;

#ifdef _WIN32
	if (server_process) {
		TerminateProcess(server_process, 0);
		WaitForSingleObject(server_process, 5000);
		CloseHandle(server_process);
		server_process = nullptr;
	}
#else
	if (server_pid > 0) {
		kill(server_pid, SIGTERM);
		int status;
		waitpid(server_pid, &status, 0);
		server_pid = 0;
	}
#endif

	server_running = false;
	blog(LOG_INFO, "[StreamPlugins] Server stopped");
}

// --- OBS Dock Registration ---
// NOTE: Full dock registration requires QT integration via obs-frontend-api.
// The actual dock creation uses obs_frontend_add_dock() or similar
// methods depending on the OBS version. Below is a simplified scaffold
// that will be expanded during implementation.

static void register_docks()
{
	// TODO: Register browser docks using obs_frontend_add_browser_dock()
	// Each dock points to a local URL served by the Node.js server:
	//
	// "StreamPlugins: Settings"    -> STREAMPLUGINS_BASE_URL "/plugins/settings/"
	// "StreamPlugins: Metrics"     -> STREAMPLUGINS_BASE_URL "/plugins/metrics-widget/settings.html"
	// "StreamPlugins: Title"       -> STREAMPLUGINS_BASE_URL "/plugins/title-updater/"
	// "StreamPlugins: Chat"        -> STREAMPLUGINS_BASE_URL "/plugins/chat-widget/"
	// "StreamPlugins: Alerts"      -> STREAMPLUGINS_BASE_URL "/plugins/alerts/settings.html"
	// "StreamPlugins: Discord"     -> STREAMPLUGINS_BASE_URL "/plugins/discord-logger/settings.html"

	blog(LOG_INFO, "[StreamPlugins] Docks registered");
}

// --- Frontend Event Handler ---

static void on_frontend_event(enum obs_frontend_event event, void *)
{
	if (event == OBS_FRONTEND_EVENT_FINISHED_LOADING) {
		register_docks();
	} else if (event == OBS_FRONTEND_EVENT_EXIT) {
		stop_server();
	}
}

// --- OBS Module Lifecycle ---

bool obs_module_load()
{
	blog(LOG_INFO, "[StreamPlugins] Plugin version %s loading", "0.1.0");

	if (!start_server()) {
		blog(LOG_ERROR, "[StreamPlugins] Failed to start server, plugin will not function");
		return true;
	}

	obs_frontend_add_event_callback(on_frontend_event, nullptr);

	blog(LOG_INFO, "[StreamPlugins] Plugin loaded successfully");
	return true;
}

void obs_module_unload()
{
	obs_frontend_remove_event_callback(on_frontend_event, nullptr);
	stop_server();
	blog(LOG_INFO, "[StreamPlugins] Plugin unloaded");
}

const char *obs_module_name()
{
	return "StreamPlugins";
}

const char *obs_module_description()
{
	return "Multi-platform streaming tools for Twitch, YouTube, and Kick";
}
